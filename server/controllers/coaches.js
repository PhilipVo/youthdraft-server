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
    xlsxConverter('sample.xlsx').then(jsonArray => {
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
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, email, division, phoneNumber, createdAt, " +
        "updatedAt, HEX(leagueId) as leagueId FROM coaches WHERE leagueId = UNHEX(?) AND id = UNHEX(?)";
      return connection.execute(query, [req.user.leagueId, req.user.id]);
    }).spread(data => res.status(200).json(data[0]))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  login: (req, res) => {
		// Validate login data:
		if (!req.body.email || !req.body.password || !req.body.leagueName)
			return res.status(400).json({ message: "All form fields are required." });

		// Pre-validate password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
			return res.status(400).json({ message: "Email/password/league name does not match." });

		Promise.using(getConnection(), connection => {
			// Get user by email:
			const query = "SELECT HEX(id) AS id, email, password FROM leagues WHERE email = ? AND leagueId = ? LIMIT 1";
			return connection.execute(query, [req.body.email, req.body.leagueName]);
		}).spread(data => {
			if (data.length == 0)
				throw { status: 400, message: "Email/password/league name does not match." };

			// Check valid password:
			return [bcrypt.compareAsync(req.body.password, data[0].password), data];
		}).spread((isMatch, data) => {
			if (!isMatch)
				throw { status: 400, message: "Email/password/league name does not match." };

			const gametimeToken = jwt.sign({
				iat: Math.floor(Date.now() / 1000) - 30,
				id: data[0].id
			}, jwtKey);
			return res.status(200).json(gametimeToken);
		}).catch(error => {
			if (error.status)
				return res.status(error.status).json({ message: error.message });
			return res.status(400).json({ message: "Please contact an admin.", error: error});
		});
	},
  coaches: (req, res) => {
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

    const query = "UPDATE coaches SET email = ?, firstName = ?, lastName = ?, phoneNumber = ?, division = ?, " +
      "city = ?, state = ?, updatedAt = NOW() WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
    const data = [
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.body.phoneNumber,
      req.body.division,
      req.body.city,
      req.body.state
    ];
    if (!req.user.league) {
      data.push(req.params.id);
      data.push(req.user.id);
    } else {
      data.push(req.user.id);
      data.push(req.user.leagueId);
    }
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

    const password = generator.generate({ length: 10, numbers: true });
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
    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.phoneNumber ||
      !req.body.division ||
			!req.body.city ||
      !req.body.state ||
      !req.body.leagueId
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    const id = uuid().replace(/\-/g, "")

    //Setup the query
    const query = "INSERT INTO coaches SET id = UNHEX(?), email = ?, firstName = ?, lastName = ?, phoneNumber = ?, " +
      "division = ?, city = ?, state = ?, validated = 0, updatedAt = NOW(), createdAt = NOW(), leagueId = UNHEX(?)";
    const data = [
      id,
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.body.phoneNumber,
      req.body.division,
      req.body.city,
      req.body.state,
      req.body.leagueId
    ];

    Promise.using(getConnection(), connection => connection.execute(query, data))
    .then(() => res.end())
    .catch(error => {
			if (error["code"] == "ER_DUP_ENTRY")
				return res.status(400).json({ message: "Email already associated with this league." });
			return res.status(400).json({ message: "Please contact an admin."});
		});
	},
  login: (req, res) => {
		// Validate login data:
		if (!req.body.email || !req.body.password || !req.body.leagueId)
			return res.status(400).json({ message: "All form fields are required." });

		// Pre-validate password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
			return res.status(400).json({ message: "Email/password/league name does not match." });

		Promise.using(getConnection(), connection => {
			// Get user by email:
			const query = "SELECT HEX(id) AS id, email, password, validated FROM coaches WHERE email = ? AND leagueId = UNHEX(?) LIMIT 1";
			return connection.execute(query, [req.body.email, req.body.leagueId]);
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
        leagueId: req.body.leagueId,
			}, jwtKey);
			return res.status(200).json(gametimeToken);
		}).catch(error => {
			if (error.status)
				return res.status(error.status).json({ message: error.message });
			return res.status(400).json({ message: "Please contact an admin."});
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
    const password = generator.generate({ length: 10, numbers: true });
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
	},
  test: (req, res) => {
    const password = generator.generate({ length: 10, numbers: true });
    nodeMailer.mailOptions.to = "c4fusion@gmail.com"
    nodeMailer.mailOptions.subject = "Your account has been validated"
    nodeMailer.mailOptions.html = "<p>Here is your password: " + password + "</p>"
    nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
    .then(info => res.status(200).json("Works"))
    .catch(error => res.status(400).json({ message: "Please contact an admin.", error: error }));
	}
}
