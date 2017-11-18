const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsx-converter');
const generator = require('generate-password');

const jwtKey = require("../../keys/keys").jwtKey;
const getConnection = require("../config/mysql");
const nodeMailer = require('../config/nodemailer');


module.exports = {
  upload: (req, res) => {
    xlsxConverter("./" + req.file.path).then(jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        if (jsonArray[i].length < 5) {
          return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        }
        if (jsonArray[i].length > 5) {
          jsonArray[i].splice(5)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(req.user.id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      Promise.using(getConnection(), connection => {
        if (jsonArray.length > 0) {
          const query = "INSERT INTO coaches (firstName, lastName, division, email, phoneNumber, " +
            "id, leagueId, createdAt, updatedAt) VALUES ?"
          console.log(jsonArray);
          return connection.query(query, [jsonArray]);
        }
        else return Promise.resolve();
      }).then(() => {
        return res.status(200).json({message: "works"})
			}).catch(error => {
        if (error.code == "ER_DUP_ENTRY")
          return res.status(400).json({message: "Error: One of the emails were duplicated"});
        return res.status(400).json(error);
      });
    }).catch(error => {
      return res.status(400).json(error);
    });
	},
  getAll: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, email, division, phoneNumber, validated, " +
        "createdAt, updatedAt, HEX(leagueId) as leagueId FROM coaches WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  get: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "You must be a coach to use this route." })
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, email, division, phoneNumber, createdAt, " +
        "updatedAt, HEX(leagueId) as leagueId FROM coaches WHERE leagueId = UNHEX(?) AND id = UNHEX(?)";
      return connection.execute(query, [req.user.leagueId, req.user.id]);
    }).spread(data => res.status(200).json(data[0]))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  reset: (req, res) => {
    // Validate reset data:
		if (!req.body.email  || !req.body.leagueName || !req.body.city || !req.body.state)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
    if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
      return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    const password = generator.generate({ length: 10, strict: true, numbers: true  });

    bcrypt.genSaltAsync(10)
			.then(salt => bcrypt.hashAsync(password, salt))
			.then(hash => Promise.using(getConnection(), connection => {
        const query = "UPDATE coaches SET password = ?, updatedAt = NOW() WHERE email = ? AND leagueId = (SELECT id " +
          "FROM leagues WHERE leagueName = ? AND city = ? AND state = ? LIMIT 1) AND validated = 1 LIMIT 1";
        return connection.execute(query, [hash, req.body.email, req.body.leagueName, req.body.city, req.body.state]);
      }))
      .spread(data => Promise.using(getConnection(), connection => {
        if (data.length == 0)
          throw { status: 400, message: "Please wait for your account to be validated before trying to reset your password." };
        const query = "SELECT * FROM coaches WHERE email = ? AND leagueId =  (SELECT id FROM leagues WHERE leagueName = ? " +
          "AND city = ? AND state = ? LIMIT 1) LIMIT 1";
        return connection.execute(query, [req.body.email, req.body.leagueName, req.body.city, req.body.state]);
      }))
      .spread(data => {
        nodeMailer.mailOptions.to = req.body.email
        nodeMailer.mailOptions.subject = "Your password has been reset"
        nodeMailer.mailOptions.html = "<p>" + data[0].firstName + " " + data[0].lastName + " here is your new password: " + password + "</p>"
        return nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
      })
      .then(info => res.status(200).json())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin."});
      });
  },
  coaches: (req, res) => {
    // Expecting all form data.
		if (
			(!req.body.email && req.user.league) ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.phoneNumber ||
      (!req.body.division && !req.user.league)||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    req.body.division = req.body.division.toLowerCase();

    let query = "UPDATE coaches SET firstName = ?, lastName = ?, phoneNumber = ?, city = ?, state = ?, ";

    const data = [
      req.body.firstName,
      req.body.lastName,
      req.body.phoneNumber,
      req.body.city,
      req.body.state
    ];
    if (!req.user.league) {
      query += "division = ?, "
      data.push(req.body.division);
      data.push(req.params.id);
      data.push(req.user.id);
    } else {
      query += "email = ?, "
      data.push(req.body.email);
      data.push(req.user.id);
      data.push(req.user.leagueId);
    }
    query += "updatedAt = NOW() WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
    console.log(data);
    Promise.using(getConnection(), connection => connection.execute(query, data))
    .then(() => res.end())
    .catch(error => {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      return res.status(400).json({ message: "Please contact an admin." });
    });
	},
  createCoaches: (req, res) => {
    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.phoneNumber ||
      !req.body.division ||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    req.body.division = req.body.division.toLowerCase();

    const password = generator.generate({ length: 10, strict: true, numbers: true  });
    bcrypt.genSaltAsync(10)
			.then(salt => bcrypt.hashAsync(password, salt))
			.then(hash => Promise.using(getConnection(), connection => {
        const query = "INSERT INTO coaches SET id = UNHEX(?), email = ?, firstName = ?, lastName = ?, phoneNumber = ?, " +
          "division = ?, city = ?, state = ?, password = ?, validated = 1, updatedAt = NOW(), createdAt = NOW(), " +
          "leagueId = UNHEX(?)";
        const data = [
          uuid().replace(/\-/g, ""),
          req.body.email,
          req.body.firstName,
          req.body.lastName,
          req.body.phoneNumber,
          req.body.division,
          req.body.city,
          req.body.state,
          hash,
          req.user.id
        ];
        return connection.execute(query, data);
      }))
      .spread(data => {
        nodeMailer.mailOptions.to = req.body.email;
        nodeMailer.mailOptions.subject = "Your account has been validated";
        nodeMailer.mailOptions.html = "<p>" + req.body.firstName + " " + req.body.lastName +
          " here is your password: " + password + "</p>";
        return nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
      })
      .then(info => res.status(200).json())
      .catch(error => {
        return res.status(400).json({ message: "Please contact an admin." });
      });
  },
  register: (req, res) => {
    let query2;
    const data2 = [];
    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.phoneNumber ||
      !req.body.division ||
			!req.body.city ||
      !req.body.state ||
      (!req.body.yearsExperience && req.body.yearsExperience != 0) ||
      !req.body.pastDivisions ||
      !req.body.leagueName ||
      !req.body.leagueCity ||
      !req.body.leagueState
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    req.body.division = req.body.division.toLowerCase();

    const id = uuid().replace(/\-/g, "")

    //Setup the query
    const query = "INSERT INTO coaches SET id = UNHEX(?), email = ?, firstName = ?, lastName = ?, phoneNumber = ?, " +
      "division = ?, city = ?, state = ?, yearsExperience = ?, pastLeague = ?, validated = 0, updatedAt = NOW(), " +
      "createdAt = NOW(), leagueId = (SELECT id FROM leagues WHERE leagueName = ? AND city = ? AND state = ? LIMIT 1)";
    const data = [
      id,
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.body.phoneNumber,
      req.body.division,
      req.body.city,
      req.body.state,
      req.body.yearsExperience,
      req.body.pastLeague,
      req.body.leagueName,
      req.body.leagueCity,
      req.body.leagueState
    ];

    const tempData = req.body.pastDivisions
    const tempLength = tempData.length
    // Make sure the amount of data being inserted is not ridiculous
    if (tempLength > 0 && tempLength < 10 ) {
      query2 = "INSERT INTO coachPastDivisions (coachId, division, createdAt, updatedAt) VALUES ?"
      for (let i = 0; i < tempLength; i++) {
        data2.push([new Buffer(id, "hex"), tempData[i], "NOW()", "NOW()"])
      }
    }

    Promise.using(getConnection(), connection => connection.execute(query, data))
    .then(() => {
      if (query2)
      console.log(data2);
        return Promise.using(getConnection(), connection => connection.query(query2, [data2]));
    })
    .then(() => res.end())
    .catch(error => {
			if (error["code"] == "ER_DUP_ENTRY")
				return res.status(400).json({ message: "Email already associated with this league." });
			return res.status(400).json({ message: "Please contact an admin.", error:error});
		});
	},
  login: (req, res) => {
		// Validate login data:
    if (!req.body.email || !req.body.password || !req.body.leagueName || !req.body.city || !req.body.state)
			return res.status(400).json({ message: "All form fields are required." });

		// Pre-validate password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
			return res.status(400).json({ message: "Email/password/league name does not match." });

		Promise.using(getConnection(), connection => {
			// Get user by email:
			const query = "SELECT HEX(b.id) AS id, b.email as email, b.password as password, b.validated as validated, " +
        "HEX(b.leagueId) as leagueId FROM leagues as a INNER JOIN coaches as b ON a.id = b.leagueId WHERE b.email = ? " +
        "AND a.leagueName = ? AND a.city = ? AND a.state = ? LIMIT 1";
			return connection.execute(query, [req.body.email, req.body.leagueName, req.body.city, req.body.state]);
		}).spread(data => {
			if (data.length == 0)
				throw { status: 400, message: "Email/password/league name does not match." };

      if (data[0].validated != 1)
        throw { status: 400, message: "Your account has not been validated." };

			// Check valid password:
			return [bcrypt.compareAsync(req.body.password, data[0].password), data];
		}).spread((isMatch, data) => {
			if (!isMatch)
				throw { status: 400, message: "Email/password/league name does not match." };
      console.log(req.body.leagueId);
			const gametimeToken = jwt.sign({
				iat: Math.floor(Date.now() / 1000) - 30,
				id: data[0].id,
        leagueId: data[0].leagueId,
			}, jwtKey);
			return res.status(200).json(gametimeToken);
		}).catch(error => {
			if (error.status)
				return res.status(error.status).json({ message: error.message });
			return res.status(400).json({ message: "Please contact an admin.", error:error});
		});
	},
  password: (req, res) => {
    // Check if form data is filled:
    if (!req.body.oldPassword  || !req.body.newPassword) {
      return res.status(400).json({ message: "Both password field should be filled" });
    }
    // Check if password match each other:
    if (req.body.oldPassword === req.body.newPassword) {
      return res.status(400).json({ message: "Old password and new password should not match." });
    }
    // Pre-validate old password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.oldPassword))
			return res.status(400).json({ message: "Current password is incorrect." });
    // Validate new password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.newPassword))
			return res.status(400).json({
				message: "Password must be at least 8 characters long and " +
				"have a lowercase letter, an uppercase letter, and a number."
			});

    Promise.using(getConnection(), connection => {
			// Get password by id:
			const query = "SELECT password FROM coaches WHERE id = UNHEX(?) LIMIT 1";
			return connection.execute(query, [req.user.id]);
		}).spread(data => {
			if (data.length == 0)
				throw { status: 400, message: "Current password is incorrect." };
			// Check valid password:
			return bcrypt.compareAsync(req.body.oldPassword, data[0].password)
		}).then(isMatch => {
      if (!isMatch)
        throw { status: 400, message: "Current password is incorrect." };
      return bcrypt.genSaltAsync(10);
    }).then(salt => bcrypt.hashAsync(req.body.newPassword, salt))
      .then(hash => Promise.using(getConnection(), connection => {
        const query = "UPDATE coaches SET password = ?, updatedAt = NOW() WHERE id = UNHEX(?) LIMIT 1";
  			return connection.execute(query, [hash, req.user.id]);
      }))
      .then(() => res.status(200).json())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin."});
      });
	},
  validate: (req, res) => {
    const password = generator.generate({ length: 10, strict: true, numbers: true  });
    bcrypt.genSaltAsync(10)
			.then(salt => bcrypt.hashAsync(password, salt))
			.then(hash => Promise.using(getConnection(), connection => {
        const query = "UPDATE coaches SET validated = 1 , password = ?, updatedAt = NOW() WHERE id = UNHEX(?) " +
        "AND leagueId = UNHEX(?) AND validated != 1 LIMIT 1";
        return connection.execute(query, [hash, req.params.id, req.user.id]);
      }))
      .spread(data => Promise.using(getConnection(), connection => {
        if (data.affectedRows == 0)
          throw { status: 400, message: "This coach has already been validated." };

        const query = "SELECT * FROM coaches WHERE id = UNHEX(?) " +
          "AND leagueId = UNHEX(?) LIMIT 1";
        return connection.execute(query, [req.params.id, req.user.id]);
      }))
      .spread(data => {
        nodeMailer.mailOptions.to = data[0].email
        nodeMailer.mailOptions.subject = "Your account has been validated"
        nodeMailer.mailOptions.html = "<p>" + data[0].firstName + " " + data[0].lastName + " here is your password: " + password + "</p>"
        return nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
      })
      .then(info => res.status(200).json())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin." });
      });
  },
  delete: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM coaches WHERE id = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
