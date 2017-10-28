const getConnection = require("../config/mysql");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxj = require("xlsx-to-json");
const xlsx2json = require('xlsx2json');


module.exports = {
  uploadCoaches: (req, res) => {
    xlsx2json('sample.xlsx', {
      sheet: 0,
      dataStartingRow: 1,
      mapping: {
        firstName: "A",
        lastName: "B",
        divsion: "C",
        team: "D",
        email: "E",
        phoneNumber: "F"
      }
    }).then(jsonArray => {
      return res.status(200).json(jsonArray);
    }).catch(error => {
      return res.status(400).json(error);
    });
	},
  uploadPlayers: (req, res) => {
    xlsx2json('sample.xlsx', {
      sheet: 0,
      dataStartingRow: 1,
      mapping: {
        firstName: "A",
        lastName: "B",
        age: "C",
        gender: "D",
        division: "E"
      }
    }).then(jsonArray => {
      return res.status(200).json(jsonArray);
    }).catch(error => {
      return res.status(400).json(error);
    });
	},
  createTryouts: (req, res) => {

	},
  createLeague: (req, res) => {

	},
  getCoaches: (req, res) => {

	},
  getPlayers: (req, res) => {

	},
  getTryouts: (req, res) => {

	},
  updateCoaches: (req, res) => {

	},
  updatePlayers: (req, res) => {

	},
  updateTryouts: (req, res) => {

	},
  updateAccount: (req, res) => {

	},
  updatePassword: (req, res) => {

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
			const query = "SELECT HEX(id) AS id, email, password, loginAt FROM leagues WHERE email = ? AND leagueName = ? LIMIT 1";
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
			return res.status(400).json({ message: "Please contact an admin." });
		});
	},
  register: (req, res) => {
		// Expecting body.email & body.password.
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
				const query = "INSERT INTO leagues SET id = UNHEX(?), email = ?, password = ?, firstName = ? " +
					"lastName = ?, leagueName = ?, phoneNumber = ?, city = ?, state = ?, createdAt = NOW(), updatedAt = NOW()";
				return connection.execute(query, data);
			})).spread(data => {
				const youthDraftToken = jwt.sign({
					id: id,
					iat: Math.floor(Date.now() / 1000) - 30
				}, jwtKey);
				return res.status(200).json(youthDraftToken);
			}).catch(error => {
				if (error["code"] == "ER_DUP_ENTRY")
					return res.status(400).json({ message: "Email already in use." });
				return res.status(400).json({ message: "Please contact an admin." });
			});
	}
}
