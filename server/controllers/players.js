const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsx-converter');

const getConnection = require("../config/mysql");


module.exports = {
  upload: (req, res) => {
    xlsxConverter('sample.xlsx').then(jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        if (jsonArray[i].length < 13) {
          return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        }
        if (jsonArray[i].length > 13) {
          jsonArray[i].splice(13)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(req.user.id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      Promise.using(getConnection(), connection => {
        if (jsonArray.length > 0) {
          const query = "INSERT INTO players (firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, " +
            "email, pitcher, catcher, coachsKid, division, parentFirstName, parentLastName, id, teamId, leagueId, " +
            "createdAt, updatedAt) VALUES ?";
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
  getDivision: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, email, division, " +
        "pitcher, catcher, coachsKid, parentFirstName, parentLastName, createdAt, updatedAt, HEX(leagueId) as leagueId, " +
        "HEX(teamId) as teamId FROM players WHERE leagueId = UNHEX(?) AND division = ?";
      return connection.execute(query, [req.user.id, req.params.division]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  getAll: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, email, division, " +
        "pitcher, catcher, coachsKid, parentFirstName, parentLastName, createdAt, updatedAt, HEX(leagueId) as leagueId, " +
        "HEX(teamId) as teamId FROM players WHERE leagueId = UNHEX(?)";
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
      !req.body.teamNumber ||
      !req.body.birthday ||
      !req.body.leagueAge ||
			!req.body.phoneNumber ||
      !req.body.email ||
      !req.body.division ||
      !req.body.pitcher ||
      !req.body.catcher ||
			!req.body.coachsKid ||
      !req.body.parentFirstName ||
      !req.body.parentLastName ||
      !req.body.teamId
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query = "UPDATE players SET firstName = ?, lastName = ?, teamNumber = ?, birthday = ?, leagueAge = ?, " +
        "phoneNumber = ?, email = ?, division = ?, pitcher = ?, catcher = ?, coachsKid = ?, parentFirstName = ?, " +
        "parentLastName = ?, updatedAt = NOW(), teamId = UNHEX(?) WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
      data = [
        req.body.firstName,
        req.body.lastName,
        req.body.teamNumber,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.division,
        req.body.pitcher,
        req.body.catcher,
  			req.body.coachsKid,
        req.body.parentFirstName,
        req.body.parentLastName,
        req.body.teamId,
        req.params.id,
        req.user.id
      ];
    } else {
      query = "INSERT INTO players SET id = UNHEX(?), leagueId = UNHEX(?), teamId = UNHEX(?), firstName = ?, lastName = ?, " +
        "teamNumber = ?, birthday = ?, leagueAge = ?, phoneNumber = ?, email = ?, division = ?, pitcher = ?, catcher = ?, " +
        "coachsKid = ?, parentFirstName = ?, parentLastName = ?, updatedAt = NOW(), createdAt = NOW()";
      data = [
        uuid().replace(/\-/g, ""),
        req.user.id,
        req.body.teamId,
        req.body.firstName,
        req.body.lastName,
        req.body.teamNumber,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.division,
        req.body.pitcher,
        req.body.catcher,
  			req.body.coachsKid,
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
  delete: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM players WHERE id = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
