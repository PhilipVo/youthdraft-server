const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  get: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can see player stats." })
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT hittingMechanics, hittingMechanicsNotes, batSpeed, batSpeedNotes, batContact, " +
        "batContactNotes, throwingMechanics, throwingMechanicsNotes, armStrength, armStrengthNotes, armAccuracy, " +
        "armAccuracyNotes, inField, inFieldNotes, outField, outFieldNotes, baserunMechanics, baserunMechanicsNotes, " +
        "baserunSpeed, baserunSpeedNotes, division, createdAt as createdAt, updatedAt FROM stats WHERE playerId = UNHEX(?) " +
        "AND coachId = UNHEX(?) ORDER BY createdAt DESC LIMIT 2"
      return connection.execute(query, [req.params.playerId, req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  getAll: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can see player stats." })
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT a.firstName as firstName, a.lastName as lastName, a.teamNumber as teamNumber, " +
        "d.hittingMechanics as hittingMechanics, d.hittingMechanicsNotes as hittingMechanicsNotes, d.batSpeed as batSpeed, " +
        "d.batSpeedNotes as batSpeedNotes, d.batContact as batContact, d.batContactNotes as batContactNotes, " +
        "d.throwingMechanics as throwingMechanics, d.throwingMechanicsNotes as throwingMechanicsNotes, " +
        "d.armStrength as armStrength, d.armStrengthNotes as armStrengthNotes, d.armAccuracy as armAccuracy, " +
        "d.armAccuracyNotes as armAccuracyNotes, d.inField as inField, d.inFieldNotes as inFieldNotes, " +
        "d.outField as outField, d.outFieldNotes as outFieldNotes, d.baserunMechanics as baserunMechanics, " +
        "d.baserunMechanicsNotes as baserunMechanicsNotes, d.baserunSpeed as baserunSpeed, " +
        "d.baserunSpeedNotes as baserunSpeedNotes, d.division as division, d.createdAt as createdAt, " +
        "d.updatedAt as updatedAt FROM players a LEFT JOIN (SELECT b.* FROM stats b WHERE b.id = (SELECT " +
        "c.createdAt FROM stats c WHERE c.playerId = b.playerId ORDER BY c.createdAt DESC LIMIT 2)) AS d ON " +
        "a.id = d.playerId WHERE d.coachId = UNHEX(?) AND a.leagueId = UNHEX(?)"
      return connection.execute(query, [req.user.id, req.user.leagueId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin.", error: error }));
	},
  stats: (req, res) => {
    let query, data = [], addedQuery = false;
    const id = uuid().replace(/\-/g, "");

    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can change player stats." })
    }
    if (!req.params.id && (!req.body.playerId || !req.body.teamId)) {
      return res.status(400).json({ message: "Something went wrong, please try again." })
    }

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query = "UPDATE stats SET ";
    } else {
      query = "INSERT INTO stats SET id = UNHEX(?), coachId = UNHEX(?), playerId = UNHEX(?), teamId = UNHEX(?),";
      data = [
        id,
        req.user.id,
        req.body.playerId,
        req.body.teamId,
      ];
    }
    if (req.body.hittingMechanics) {
      addedQuery = true;
      query += " hittingMechanics = ?";
      data.push(req.body.hittingMechanics);
    }
    if (req.body.hittingMechanicsNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " hittingMechanicsNotes = ?";
      data.push(req.body.hittingMechanicsNotes);
    }
    if (req.body.batSpeed) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " batSpeed = ?";
      data.push(req.body.batSpeed);
    }
    if (req.body.batSpeedNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " batSpeedNotes = ?";
      data.push(req.body.batSpeedNotes);
    }
    if (req.body.batContact) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " batContact = ?";
      data.push(req.body.batContact);
    }
    if (req.body.batContactNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " batContactNotes = ?";
      data.push(req.body.batContactNotes);
    }
    if (req.body.throwingMechanics) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " throwingMechanics = ?";
      data.push(req.body.throwingMechanics);
    }
    if (req.body.throwingMechanicsNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " throwingMechanicsNotes = ?";
      data.push(req.body.throwingMechanicsNotes);
    }
    if (req.body.armStrength) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " armStrength = ?";
      data.push(req.body.armStrength);
    }
    if (req.body.armStrengthNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " armStrengthNotes = ?";
      data.push(req.body.armStrengthNotes);
    }
    if (req.body.armAccuracy) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " armAccuracy = ?";
      data.push(req.body.armAccuracy);
    }
    if (req.body.armAccuracyNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " armAccuracyNotes = ?";
      data.push(req.body.armAccuracyNotes);
    }
    if (req.body.inField) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " inField = ?";
      data.push(req.body.inField);
    }
    if (req.body.inFieldNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " inFieldNotes = ?";
      data.push(req.body.inFieldNotes);
    }
    if (req.body.outField) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " outField = ?";
      data.push(req.body.outField);
    }
    if (req.body.outFieldNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " outFieldNotes = ?";
      data.push(req.body.outFieldNotes);
    }
    if (req.body.baserunMechanics) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " baserunMechanics = ?";
      data.push(req.body.baserunMechanics);
    }
    if (req.body.baserunMechanicsNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " baserunMechanicsNotes = ?";
      data.push(req.body.baserunMechanicsNotes);
    }
    if (req.body.baserunSpeed) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " baserunSpeed = ?";
      data.push(req.body.baserunSpeed);
    }
    if (req.body.baserunSpeedNotes) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " baserunSpeedNotes = ?";
      data.push(req.body.baserunSpeedNotes);
    }
    if (req.body.division) {
      if (addedQuery) {
        query += ","
      }
      addedQuery = true;
      query += " division = ?";
      req.body.division = req.body.division.toLowerCase()
      data.push(req.body.division);
    }
    if (!addedQuery) {
      return res.status(400).json({ message: "Please fillout your formula before submitting" });
    }
    if (req.params.id) {
      query += ", updatedAt = NOW() WHERE id = UNHEX(?) AND coachId = UNHEX(?) LIMIT 1";
      data.push(req.params.id)
      data.push(req.user.id)
    } else {
      query += ", updatedAt = NOW(), createdAt = NOW()";
    }
    console.log(data);
    console.log(query);
    Promise.using(getConnection(), connection => connection.execute(query, data))
      .then(() => {
        let results
        if (!req.params.id) {
          results = id
        }
        return res.status(200).json(results)
      })
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin.", error: error });
      });
	},
  delete: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can delete player stats." })
    }
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM stats WHERE id = UNHEX(?) AND coachId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
