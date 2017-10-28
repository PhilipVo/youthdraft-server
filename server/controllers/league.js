const getConnection = require("../config/mysql");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const uuid = require('uuid/v1');


module.exports = {
  create: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "INSERT INTO followings SET id = UNHEX(?), sport = ?, " +
        "team = ?, createdAt = NOW(), updatedAt = NOW()";
      return connection.execute(query, [req.user.id, req.body.sport, req.body.team]);
    }).then(() => res.end())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
  },
  delete: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM followings WHERE id = UNHEX(?) AND sport = ? AND team = ? LIMIT 1";
      return connection.execute(query, [req.user.id, req.params.sport, req.params.team]);
    }).then(() => res.end())
      .catch(error => res.status(400).json({ message: error }));
  },
  getFollowedTeams: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT team, sport FROM followings WHERE id = UNHEX(?) ORDER BY sport, team";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
  },
  getFollowedTeamsForSport: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT team FROM followings WHERE id = UNHEX(?) AND sport = ? ORDER BY team";
      return connection.execute(query, [req.user.id, req.params.sport]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
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
				const data = [id, req.body.email, hash];
				const query = "INSERT INTO users SET id = UNHEX(?), email = ?, password = ?, " +
					"deviceToken = NULL, createdAt = NOW(), updatedAt = NOW(), loginAt = ?";
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
