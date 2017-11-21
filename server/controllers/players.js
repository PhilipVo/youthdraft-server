const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsx-converter');

const getConnection = require("../config/mysql");

module.exports = {
  upload: (req, res) => {
    xlsxConverter("./" + req.file.path).then(jsonArray => {
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
      console.log(jsonArray);
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
    req.body.division = req.body.division.toLowerCase();
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, email, " +
        "division, gender, pitcher, catcher, coachsKid, parentFirstName, parentLastName, createdAt, updatedAt, " +
        "HEX(leagueId) as leagueId, HEX(teamId) as teamId FROM players WHERE leagueId = UNHEX(?) AND division = ?";
      return connection.execute(query, [req.user.id, req.params.division]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  getAll: (req, res) => {
    let tempId = [req.user.id]
    let query = "SELECT HEX(id) as id, firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, email, " +
      "division, gender, pitcher, catcher, coachsKid, parentFirstName, parentLastName, createdAt, updatedAt, " +
      "HEX(leagueId) as leagueId, HEX(teamId) as teamId FROM players WHERE leagueId = UNHEX(?)";
    if (req.user.leagueId) {
      tempId = [req.user.id, req.user.leagueId, req.user.leagueId]
      query = "SELECT HEX(c.id) as id, c.firstName as firstName, c.lastName as lastName, c.teamNumber as teamNumber, " +
        "c.birthday as birthday, c.leagueAge as leagueAge, c.phoneNumber as phoneNumber, c.email as email, " +
        "c.division as division, c.gender as gender, c.pitcher as pitcher, c.catcher as catcher, c.coachsKid as coachsKid, " +
        "c.parentFirstName as parentFirstName, c.parentLastName as parentLastName, c.createdAt as createdAt, " +
        "c.updatedAt as updatedAt, HEX(c.leagueId) as leagueId, HEX(c.teamId) as teamId, b.name as teamName, " +
        "b.division as division FROM coaches as a INNER JOIN teams as b ON a.division = b.division INNER JOIN players " +
        "as c ON b.id = c.teamId WHERE a.id = UNHEX(?) AND b.leagueId = UNHEX(?) AND c.leagueId = UNHEX(?)";
    }
    Promise.using(getConnection(), connection => connection.execute(query, tempId))
      .spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  players: (req, res) => {
    if (req.user.leagueId)
      return res.status(400).json({ message: "Only a League Admin can add or change a player"});

    let query, data, pitcher = 0, catcher = 0, coachsKid = 0, requestType = "newPlayer"
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
      !req.body.gender ||
      !req.body.pitcher ||
      !req.body.catcher ||
			!req.body.coachsKid ||
      !req.body.parentFirstName ||
      !req.body.parentLastName ||
      !req.body.teamId
		)
			return res.status(400).json({ message: "All form fields are required."});

    // Validate phone number:
		if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(req.body.phoneNumber))
			return res.status(400).json({ message: "Invalid phone number.  Phone number format should be XXX-XXX-XXXX" });

    // Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    if (req.body.pitcher == "true") {
      pitcher = 1
    }
    if (req.body.catcher == "true") {
      catcher = 1
    }
    if (req.body.coachsKid == "true") {
      coachsKid = 1
    }

    req.body.division = req.body.division.toLowerCase();

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      requestType = "updatePlayer"
      query = "UPDATE players SET firstName = ?, lastName = ?, teamNumber = ?, birthday = ?, leagueAge = ?, " +
        "phoneNumber = ?, email = ?, division = ?, gender = ?, pitcher = ?, catcher = ?, coachsKid = ?, parentFirstName = ?, " +
        "parentLastName = ?, updatedAt = NOW(), teamId = UNHEX(?) WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
      req.body.id = req.params.id;
      data = [
        req.body.firstName,
        req.body.lastName,
        req.body.teamNumber,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.division,
        req.body.gender,
        pitcher,
        catcher,
        coachsKid,
        req.body.parentFirstName,
        req.body.parentLastName,
        req.body.teamId,
        req.body.id,
        req.user.id
      ];
    } else {
      query = "INSERT INTO players SET id = UNHEX(?), leagueId = UNHEX(?), teamId = UNHEX(?), firstName = ?, lastName = ?, " +
        "teamNumber = ?, birthday = ?, leagueAge = ?, phoneNumber = ?, email = ?, division = ?, gender = ?, pitcher = ?, "
        "catcher = ?, coachsKid = ?, parentFirstName = ?, parentLastName = ?, updatedAt = NOW(), createdAt = NOW()";
      req.body.id = uuid().replace(/\-/g, "");
      data = [
        req.body.id,
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
        req.body.gender,
        pitcher,
        catcher,
        coachsKid,
        req.body.parentFirstName,
        req.body.parentLastName
      ];
    }
    Promise.using(getConnection(), connection => connection.execute(query, data))
      .then(() => {
        req.io.sockets.in(req.user.id).emit(requestType, req.body);
        res.status(200).json({id:req.body.id})
      })
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
    }).spread(data => {
      req.io.sockets.in(req.user.id).emit("deletedPlayer", {id:req.params.id});
      res.end()
    })
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
