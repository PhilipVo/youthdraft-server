const 	getConnection 	= require("../config/mysql"),
		Promise 		= require("bluebird"),
		uuid 			= require('uuid/v1'),
		jwt 			= require("jsonwebtoken"),
		jwtKey 			= require("../../keys/keys").jwtKey,
		bcrypt 			= Promise.promisifyAll(require("bcrypt")),

		using 			= Promise.using;

module.exports = {
	show: (req, res) => {
		using(getConnection(), connection => {
			const data = [req.user.id, req.user.loginAt];
      		const query = "SELECT username, email, firstName, lastName, teams FROM users " +
				"where id = UNHEX(?) and loginAt = ? LIMIT 1";
      		return connection.execute(query, data);
		}).spread(data => {
			if (data && data.length > 0){
				res.status(200).json(data)
			} else {
				res.status(400).json({ message: "Please login." })
			}
		})
		.catch(error => {
			res.status(400).json({ message: "Please contact an admin." })
		});
	},

	register: (req, res) => {
		if (!req.body.email || !req.body.password)
			return res.status(400).json({ message: "All form fields are required." });
		// Validate email:
	    if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

	    // Validate password:
	    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
			return res.status(400).json({
				message: "Password must be at least 8 characters long and " +
				"have a lowercase letter, an uppercase letter, and a number."
			});

		const userId = uuid().replace(/\-/g, "");
		const loginAt = Date.now();

		bcrypt.genSaltAsync(10)
		.then(salt => bcrypt.hashAsync(req.body.password, salt))
		.then(hash => using(getConnection(), connection => {
			//Just to prevent exceptions
			if (!req.body.username) {
				req.body.username = ""
			}
			if (!req.body.firstName) {
				req.body.firstName = ""
			}
			if (!req.body.lastName) {
				req.body.lastName = ""
			}
			if (!req.body.teams) {
				req.body.teams = ""
			}
			const data = [userId, req.body.email, req.body.username, req.body.firstName, req.body.lastName, hash, req.body.teams, loginAt];
			const query = "INSERT INTO users SET id = UNHEX(?), email = ?, username = ?, firstName = ?, lastName = ?, " +
				"password = ?, teams = ?, deviceToken = NULL, createdAt = NOW(), updatedAt = NOW(), loginAt = ?";
			return connection.execute(query, data);
		})).spread(data => {
			const gametimeToken = jwt.sign({ id: uuid, loginAt: loginAt, iat: Math.floor(Date.now() / 1000) - 30 }, jwtKey);
			return res.json(gametimeToken);
		}).catch(error => {
			if (error["code"] == "ER_DUP_ENTRY")
				return res.status(400).json({ message: "Email/username already in use." });
			return res.status(400).json({ message: "Please contact an admin."});
        });
	},

	update: (req, res) => {
		if (!req.body.email)
			return res.status(400).json({ message: "Email is required" });

		// Validate email:
	    if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

		using(getConnection(), connection => {
			//Just to prevent exceptions
			if (!req.body.username) {
				req.body.username = ""
			}
			if (!req.body.firstName) {
				req.body.firstName = ""
			}
			if (!req.body.lastName) {
				req.body.lastName = ""
			}
			if (!req.body.teams) {
				req.body.teams = ""
			}
			const teamString = JSON.stringify(req.body.teams)
			const data = [req.body.username, req.body.firstName, req.body.lastName, req.body.email, teamString, req.user.id, req.user.loginAt];
      		const query = "UPDATE users SET username = ?, firstName = ?, lastName = ?, email = ?, teams = ?, " +
				"updatedAt = NOW() WHERE id = UNHEX(?) and loginAt = ? LIMIT 1";
			console.log("query", query)
      		return connection.execute(query, data);
		}).then(() => res.end())
		.catch(error => {
			return res.status(400).json({ message: "Please contact an admin." });
		});
	},

	login: (req, res) => {
		// Validate login data:
		if (!req.body.email || !req.body.password)
			return res.status(400).json({ message: "All form fields are required." });

		// Pre-validate password:
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&](?=.{7,})/.test(req.body.password))
			return res.status(400).json({ message: "Email/password does not match." });

		using(getConnection(), connection => {
			// Get user by email:
	        const query = "SELECT HEX(id) AS id, username, email, firstName, lastName, password, teams, " +
				"loginAt FROM users WHERE email = ? LIMIT 1";
	        return connection.execute(query, [req.body.email]);
		}).spread(data => {
			if (data.length == 0)
				throw { status: 400, message: "Email/password does not match." };

			// Check valid password:
			return [bcrypt.compareAsync(req.body.password, data[0].password), data];
	    }).spread((isMatch, data) => {
			if (!isMatch)
	        	throw { status: 400, message: "Email/password does not match." };

			let reducedResults = {
					username: data[0].username,
			        email: data[0].email,
			        firstName: data[0].firstName,
			        lastName: data[0].lastName,
			        teams: data[0].teams
				}

	      	const gametimeToken = jwt.sign({ id: data[0].id, loginAt: data[0].loginAt, iat: Math.floor(Date.now() / 1000) - 30 }, jwtKey);
	      	return res.json({token: gametimeToken, data: reducedResults});
	    }).catch(error => {
	      	if (error.status)
	        	return res.status(error.status).json({ message: error.message });
	      	return res.status(400).json({ message: "Please contact an admin." });
	    });
	},

	logout: (req, res) => {
		using(getConnection(), connection => {
			const query = "UPDATE users SET deviceToken = NULL, loginAt = NOW() WHERE id = UNHEX(?)";
			return connection.execute(query, [req.user.id]);
		}).then(() => res.end())
		.catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},

	updateDeviceToken: (req, res) => {
		using(getConnection(), connection => {
			const data = [req.body.deviceToken, req.user.id, req.user.loginAt]
	      	const query = "UPDATE users SET deviceToken = ?, updatedAt = NOW() WHERE username = ? and loginAt = ? LIMIT 1";
	      	return connection.execute(query, data);
	    }).then(() => res.end())
		.catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
