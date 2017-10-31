const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const uuid = require('uuid/v1');
const generator = require('generate-password');

const jwtKey = require("../../keys/keys").jwtKey;
const getConnection = require("../config/mysql");


module.exports = {
  create: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "UPDATE leagues SET isLive = 1 , updatedAt = NOW() WHERE id = UNHEX(?) LIMIT 1";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  get: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT email, firstName, lastName, leagueName, " +
        "phoneNumber, city, state FROM leagues WHERE id = UNHEX(?) LIMIT 1";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
  },
  getAll: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT leagueName, city, state FROM leagues";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
  },
  update: (req, res) => {
    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.leagueName ||
			!req.body.phoneNumber ||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    Promise.using(getConnection(), connection => {
      // Check if unique email entered:
      const query = "SELECT email FROM leagues WHERE email = ? LIMIT 1";
      return connection.execute(query, [req.body.email]);
    }).spread(user => {
      if (user.length === 1 && user[0].email !== req.user.email)
        throw { status: 400, message: 'Email already associated with this league.' }

      const query = "UPDATE leagues SET email = ?, firstName = ?, lastName = ?, leagueName = ?, " +
        "phoneNumber = ?, city = ?, state = ?, updatedAt = NOW() WHERE id = UNHEX(?) LIMIT 1";
      const data = [req.body.email, req.body.firstName, req.body.lastName, req.body.leagueName, req.body.phoneNumber, req.body.city, req.body.state, req.user.id];
      return Promise.using(getConnection(), connection => connection.execute(query, data));
    }).then(() => res.end())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin." });
      });
	},
  password: (req, res) => {
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
			const query = "SELECT password FROM leagues WHERE id = UNHEX(?) LIMIT 1";
			return connection.execute(query, [req.user.id]);
		}).spread(data => {
			if (data.length == 0)
				throw { status: 400, message: "Current password is incorrect." };
			// Check valid password:
			return [bcrypt.compareAsync(req.body.oldPassword, data[0].password), data];
		}).then(isMatch => {
      if (!isMatch)
        throw { status: 400, message: "Current password is incorrect." };
      return bcrypt.genSaltAsync(10);
    }).then(salt => bcrypt.hashAsync(req.body.password, salt))
      .then(hash => Promise.using(getConnection(), connection => {
        const query = "UPDATE leagues SET password = ?, updatedAt = NOW() WHERE id = UNHEX(?) LIMIT 1";
  			return connection.execute(query, [hash, req.user.id]);
      }))
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin." });
      });
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
			const query = "SELECT HEX(id) AS id, email, password FROM leagues WHERE email = ? AND leagueName = ? LIMIT 1";
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
  register: (req, res) => {
		// Expecting all form data.
		if (
			!req.body.email ||
			!req.body.password ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.leagueName ||
			!req.body.phoneNumber ||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate phone number as XXX-XXX-XXXX:
    if (!/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/.test(req.body.phoneNumber))
      return res.status(400).json({ message: "Invalid phone number. Phone number format should be: XXX-XXX-XXXX." });

		// Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

		// Validate password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
			return res.status(400).json({
				message: "Password must be at least 8 characters long and " +
				"have a lowercase letter, an uppercase letter, and a number."
			});
		const id = uuid().replace(/\-/g, "");

		bcrypt.genSaltAsync(10)
			.then(salt => bcrypt.hashAsync(req.body.password, salt))
			.then(hash => Promise.using(getConnection(), connection => {
				const data = [id, req.body.email, hash, req.body.firstName, req.body.lastName, req.body.leagueName, req.body.phoneNumber, req.body.city, req.body.state];
				const query = "INSERT INTO leagues SET id = UNHEX(?), email = ?, password = ?, firstName = ?, " +
					"lastName = ?, leagueName = ?, phoneNumber = ?, city = ?, state = ?, createdAt = NOW(), updatedAt = NOW()";
				return connection.execute(query, data);
			})).spread(data => {
				const youthDraftToken = jwt.sign({
					id: id,
          user: 'league',
					iat: Math.floor(Date.now() / 1000) - 30
				}, jwtKey);
				return res.status(200).json(youthDraftToken);
			}).catch(error => {
				if (error["code"] == "ER_DUP_ENTRY")
					return res.status(400).json({ message: "Email already associated with this league." });
				return res.status(400).json({ message: "Please contact an admin." });
			});
	}
}
