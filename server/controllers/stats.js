const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  get: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can see player stats." })
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT a.firstName as firstName, a.lastName as lastName, a.teamNumber as teamNumber, " +
        "b.hittingMechanics as hittingMechanics, b.hittingMechanicsNotes as hittingMechanicsNotes, b.batSpeed as batSpeed, " +
        "b.batSpeedNotes as batSpeedNotes, b.batContact as batContact, b.batContactNotes as batContactNotes, " +
        "b.throwingMechanics as throwingMechanics, b.throwingMechanicsNotes as throwingMechanicsNotes, " +
        "b.armStrength as armStrength, b.armStrengthNotes as armStrengthNotes, b.armAccuracy as armAccuracy, " +
        "b.armAccuracyNotes as armAccuracyNotes, b.inField as inField, b.inFieldNotes as inFieldNotes, " +
        "b.outField as outField, b.outFieldNotes as outFieldNotes, b.baserunMechanics as baserunMechanics, " +
        "b.baserunMechanicsNotes as baserunMechanicsNotes, b.baserunSpeed as baserunSpeed, " +
        "b.baserunSpeedNotes as baserunSpeedNotes, b.division as division, b.createdAt as createdAt, " +
        "b.updatedAt as updatedAt FROM players a LEFT JOIN (SELECT b.* FROM stats b WHERE b.id = (SELECT " +
        "c.createdAt FROM stats c WHERE c.playerId = b.playerId ORDER BY c.createdAt DESC LIMIT 2)) ON " +
        "a.id = b.playerId WHERE b.coachId = UNHEX(?) AND a.id = UNHEX(?)"

      return connection.execute(query, [req.user.id, req.params.playerId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  getAll: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can see player stats." })
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT a.firstName as firstName, a.lastName as lastName, a.teamNumber as teamNumber, " +
        "b.hittingMechanics as hittingMechanics, b.hittingMechanicsNotes as hittingMechanicsNotes, b.batSpeed as batSpeed, " +
        "b.batSpeedNotes as batSpeedNotes, b.batContact as batContact, b.batContactNotes as batContactNotes, " +
        "b.throwingMechanics as throwingMechanics, b.throwingMechanicsNotes as throwingMechanicsNotes, " +
        "b.armStrength as armStrength, b.armStrengthNotes as armStrengthNotes, b.armAccuracy as armAccuracy, " +
        "b.armAccuracyNotes as armAccuracyNotes, b.inField as inField, b.inFieldNotes as inFieldNotes, " +
        "b.outField as outField, b.outFieldNotes as outFieldNotes, b.baserunMechanics as baserunMechanics, " +
        "b.baserunMechanicsNotes as baserunMechanicsNotes, b.baserunSpeed as baserunSpeed, " +
        "b.baserunSpeedNotes as baserunSpeedNotes, b.division as division, b.createdAt as createdAt, " +
        "b.updatedAt as updatedAt FROM players a LEFT JOIN (SELECT b.* FROM stats b WHERE b.id = (SELECT " +
        "c.createdAt FROM stats c WHERE c.playerId = b.playerId ORDER BY c.createdAt DESC LIMIT 2)) ON " +
        "a.id = b.playerId WHERE b.coachId = UNHEX(?) AND a.leagueId = UNHEX(?)"
      return connection.execute(query, [req.user.id, req.user.leagueId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  stats: (req, res) => {
    let query2, data2 = [], addedQuery = false;
    const id = uuid().replace(/\-/g, "");

    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can change player stats." })
    }
    if (!req.body.playerId) {
      return res.status(400).json({ message: "Something went wrong, please try again." })
    }

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query2 = "UPDATE stats SET ";
    } else {
      query2 = "INSERT INTO stats SET id = UNHEX(?), coachId = UNHEX(?), playerId = UNHEX(?), leagueId = UNHEX(?),";
      data2 = [
        id,
        req.user.id,
        req.body.playerId,
        req.user.leagueId,
      ];
    }
    if (req.body.hittingMechanics) {
      addedQuery = true;
      query2 += " hittingMechanics = ?";
      data2.push(req.body.hittingMechanics);
    }
    if (req.body.hittingMechanicsNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " hittingMechanicsNotes = ?";
      data2.push(req.body.hittingMechanicsNotes);
    }
    if (req.body.batSpeed) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " batSpeed = ?";
      data2.push(req.body.batSpeed);
    }
    if (req.body.batSpeedNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " batSpeedNotes = ?";
      data2.push(req.body.batSpeedNotes);
    }
    if (req.body.batContact) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " batContact = ?";
      data2.push(req.body.batContact);
    }
    if (req.body.batContactNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " batContactNotes = ?";
      data2.push(req.body.batContactNotes);
    }
    if (req.body.throwingMechanics) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " throwingMechanics = ?";
      data2.push(req.body.throwingMechanics);
    }
    if (req.body.throwingMechanicsNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " throwingMechanicsNotes = ?";
      data2.push(req.body.throwingMechanicsNotes);
    }
    if (req.body.armStrength) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " armStrength = ?";
      data2.push(req.body.armStrength);
    }
    if (req.body.armStrengthNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " armStrengthNotes = ?";
      data2.push(req.body.armStrengthNotes);
    }
    if (req.body.armAccuracy) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " armAccuracy = ?";
      data2.push(req.body.armAccuracy);
    }
    if (req.body.armAccuracyNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " armAccuracyNotes = ?";
      data2.push(req.body.armAccuracyNotes);
    }
    if (req.body.inField) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " inField = ?";
      data2.push(req.body.inField);
    }
    if (req.body.inFieldNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " inFieldNotes = ?";
      data2.push(req.body.inFieldNotes);
    }
    if (req.body.outField) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " outField = ?";
      data2.push(req.body.outField);
    }
    if (req.body.outFieldNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " outFieldNotes = ?";
      data2.push(req.body.outFieldNotes);
    }
    if (req.body.baserunMechanics) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " baserunMechanics = ?";
      data2.push(req.body.baserunMechanics);
    }
    if (req.body.baserunMechanicsNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " baserunMechanicsNotes = ?";
      data2.push(req.body.baserunMechanicsNotes);
    }
    if (req.body.baserunSpeed) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " baserunSpeed = ?";
      data2.push(req.body.baserunSpeed);
    }
    if (req.body.baserunSpeedNotes) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " baserunSpeedNotes = ?";
      data2.push(req.body.baserunSpeedNotes);
    }
    if (!addedQuery) {
      return res.status(400).json({ message: "Please fillout your formula before submitting" });
    }
    if (req.params.id) {
      query = ", updatedAt = NOW() WHERE leagueId = UNHEX(?) AND playerId = UNHEX(?) AND id = UNHEX(?) AND " +
        "coachId = UNHEX(?) LIMIT 1";
      data.push(req.user.leagueId)
      data.push(req.body.playerId)
      data.push(req.params.id)
      data.push(req.user.id)
    } else {
      query = ", updatedAt = NOW(), createdAt = NOW()";
    }
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
        return res.status(400).json({ message: "Please contact an admin." });
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
