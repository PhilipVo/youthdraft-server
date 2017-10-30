const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsxConverter');

const getConnection = require("../config/mysql");


module.exports = {
  uploadPlayers: (req, res) => {
    xlsxConverter('sample.xlsx').then(jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        if (jsonArray[i].length < 8) {
          return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        }
        if (jsonArray[i].length > 8) {
          jsonArray[i].splice(8)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(req.user.id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      Promise.using(getConnection(), connection => {
        if (jsonArray.length > 0) {
          const query = "INSERT INTO players (firstName, lastName, birthday, leagueAge, phoneNumber, email, " +
            "parentFirstName, parentLastName, id, leagueId, createdAt, updatedAt) VALUES ?"
          return connection.query(query, [jsonArray]);
        }
        else return Promise.resolve();
      }).then(() => {
        return res.status(200).json({message: "works"})
			}).catch(error => {
        return res.status(400).json(error);
      });
    }).catch(error => {
      return res.status(400).json(error);
    });
	},
  getPlayers: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, birthday, leagueAge, phoneNumber, email, " +
        "parentFirstName, parentLastName, createdAt, updatedAt, HEX(leagueId) as leagueId FROM players WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  players: (req, res) => {
    let query, data
    // Expecting all form data.
		if (
			!req.body.firstName ||
			!req.body.lastName ||
      !req.body.birthday ||
      !req.body.leagueAge ||
			!req.body.phoneNumber ||
      !req.body.email ||
      !req.body.parentFirstName ||
      !req.body.parentLastName
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query = "UPDATE players SET firstName = ?, lastName = ?, birthday = ?, leagueAge = ?, phoneNumber = ?, " +
        "email = ?, parentFirstName = ?, parentLastName = ?, updatedAt = NOW() WHERE id = UNHEX(?) " +
        "and leagueId = UNHEX(?) LIMIT 1";
      data = [
        req.body.firstName,
        req.body.lastName,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.parentFirstName,
        req.body.parentLastName,
        req.body.id,
        req.params.id
      ];
    } else {
      query = "INSERT INTO players SET id = ?, leagueId = UNHEX(?), firstName = ?, lastName = ?, birthday = ?, leagueAge = ?, " +
        "phoneNumber = ?, email = ?, parentFirstName = ?, parentLastName = ?, updatedAt = NOW(), createdAt = NOW()";
      data = [
        uuid().replace(/\-/g, ""),
        req.user.id,
        req.body.firstName,
        req.body.lastName,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.parentFirstName,
        req.body.parentLastName
      ];
    }
    Promise.using(getConnection(), connection => connection.execute(query, data))
      .then(() => res.end())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin." });
      });
	},
  deletePlayers: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM players WHERE id = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
