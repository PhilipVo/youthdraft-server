const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsx-converter');

const getConnection = require("../config/mysql");

module.exports = {
  getDivision: (req, res) => {
    req.params.division = req.params.division.toLowerCase();
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(a.id) as id, firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, email, " +
        "division, gender, pitcher, catcher, coachsKid, parentFirstName, parentLastName, HEX(tryoutId) as tryoutId, " +
        "d.date as tryoutDate, d.address as tryoutAddress, a.createdAt, a.updatedAt, HEX(a.leagueId) as leagueId, HEX(teamId) " +
        "as teamId FROM players as a LEFT JOIN tryouts d ON tryoutId = d.id WHERE a.leagueId = UNHEX(?) AND division = ?";
      return connection.execute(query, [req.user.id, req.params.division]);
    }).spread(data => {
      for (let i = 0; i < data.length; i++) {
        data[i].pitcher = data[i].pitcher ? "true" : "false";
        data[i].catcher = data[i].catcher ? "true" : "false";
        data[i].coachsKid = data[i].coachsKid ? "true" : "false";
      }
      res.status(200).json(data)
    })
      .catch(error => res.status(400).json({ message: "Please contact an admin.", error: error  }));
	},
  getAll: (req, res) => {
    let tempId = [req.user.id]
    let query = "SELECT HEX(a.id) as id, firstName, lastName, teamNumber, birthday, leagueAge, phoneNumber, email, " +
      "division, gender, pitcher, catcher, coachsKid, parentFirstName, parentLastName, HEX(tryoutId) as tryoutId, " +
      "d.date as tryoutDate, d.address as tryoutAddress, a.createdAt, a.updatedAt, HEX(a.leagueId) as leagueId, HEX(teamId) " +
      "as teamId FROM players as a LEFT JOIN tryouts d ON tryoutId = d.id WHERE a.leagueId = UNHEX(?)";
    if (req.user.leagueId) {
      tempId = [req.user.id, req.user.leagueId]
      query = "SELECT HEX(c.id) as id, c.firstName as firstName, c.lastName as lastName, c.teamNumber as teamNumber, " +
        "c.birthday as birthday, c.leagueAge as leagueAge, c.phoneNumber as phoneNumber, c.email as email, " +
        "c.division as division, c.gender as gender, c.pitcher as pitcher, c.catcher as catcher, c.coachsKid as coachsKid, " +
        "c.parentFirstName as parentFirstName, c.parentLastName as parentLastName, HEX(c.tryoutId) as tryoutId, " +
        "d.date as tryoutDate, d.address as tryoutAddress, c.createdAt as createdAt, c.updatedAt as updatedAt, " +
        "HEX(c.leagueId) as leagueId, HEX(c.teamId) as teamId, b.name as teamName, b.division as division " +
        "FROM coaches as a INNER JOIN players as c ON a.division = c.division LEFT JOIN teams as b ON c.teamId = b.id " +
        "LEFT JOIN tryouts d ON c.tryoutId = d.id WHERE a.id = UNHEX(?) AND c.leagueId = UNHEX(?)";
    }
    Promise.using(getConnection(), connection => connection.execute(query, tempId))
      .spread(data => {
        for (let i = 0; i < data.length; i++) {
          data[i].pitcher = data[i].pitcher ? "true" : "false";
          data[i].catcher = data[i].catcher ? "true" : "false";
          data[i].coachsKid = data[i].coachsKid ? "true" : "false";
        }
        res.status(200).json(data)
      })
      .catch(error => res.status(400).json({ message: "Please contact an admin.", error: error }));
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
      !req.body.gender ||
      !req.body.pitcher ||
      !req.body.catcher ||
			!req.body.coachsKid ||
      !req.body.parentFirstName ||
      !req.body.parentLastName
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

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      requestType = "updatePlayer"
      query = "UPDATE players SET firstName = ?, lastName = ?, teamNumber = ?, birthday = ?, leagueAge = ?, " +
        "phoneNumber = ?, email = ?, gender = ?, pitcher = ?, catcher = ?, coachsKid = ?, parentFirstName = ?, " +
        "parentLastName = ?, "
      req.body.id = req.params.id;
      data = [
        req.body.firstName,
        req.body.lastName,
        req.body.teamNumber,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.gender,
        pitcher,
        catcher,
        coachsKid,
        req.body.parentFirstName,
        req.body.parentLastName
      ];
      if (req.body.division && req.body.division != "") {
        query += "division = ?, "
        data.push(req.body.division)
      }
      if (req.body.teamId && req.body.teamId != "") {
        query += "teamId = UNHEX(?), "
        data.push(req.body.teamId)
      }
      if (req.body.tryoutId && req.body.tryoutId != "") {
        query += "tryoutId = UNHEX(?), "
        data.push(req.body.tryoutId)
      }
      query += "updatedAt = NOW() WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
      data.push(req.body.id)
      data.push(req.user.id)
      console.log(query);
    } else {
      query = "INSERT INTO players SET id = UNHEX(?), leagueId = UNHEX(?), firstName = ?, lastName = ?, teamNumber = ?, " +
        "birthday = ?, leagueAge = ?, phoneNumber = ?, email = ?, gender = ?, pitcher = ?, catcher = ?, coachsKid = ?, " +
        "parentFirstName = ?, parentLastName = ?, ";
      req.body.id = uuid().replace(/\-/g, "");
      data = [
        req.body.id,
        req.user.id,
        req.body.firstName,
        req.body.lastName,
        req.body.teamNumber,
        req.body.birthday,
        req.body.leagueAge,
        req.body.phoneNumber,
        req.body.email,
        req.body.gender,
        pitcher,
        catcher,
        coachsKid,
        req.body.parentFirstName,
        req.body.parentLastName
      ];
      if (req.body.division && req.body.division != "") {
        query += "division = ?, "
        data.push(req.body.division)
      }
      if (req.body.teamId && req.body.teamId != "") {
        query += "teamId = UNHEX(?), "
        data.push(req.body.teamId)
      }
      if (req.body.tryoutId && req.body.tryoutId != "") {
        query += "tryoutId = UNHEX(?), "
        data.push(req.body.tryoutId)
      }
      query += "updatedAt = NOW(), createdAt = NOW()";
    }
    Promise.using(getConnection(), connection => connection.execute(query, data))
      .then(() => {
        req.io.sockets.in(req.user.id).emit(requestType, req.body);
        res.status(200).json({id:req.body.id})
      })
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin.", error: error});
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
