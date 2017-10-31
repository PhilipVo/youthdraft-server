const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  get: (req, res) => {
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
    let query, data
    // Expecting all form data.
		if (
			!req.body.hittingMechanics ||
			!req.body.batSpeed ||
      !req.body.batContact ||
      !req.body.throwingMechanics ||
			!req.body.armStrength ||
      !req.body.armAccuracy ||
      !req.body.inField ||
      !req.body.outField ||
      !req.body.baserunMechanics ||
      !req.body.baserunSpeed ||
      !req.body.leagueId
		)
			return res.status(400).json({ message: "Please fill out all assessment scores." });

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query = "UPDATE formulas SET hittingMechanics = ?, hittingMechanicsNotes = ?, batSpeed = ?, batSpeedNotes = ?, " +
        "batContact = ?, batContactNotes = ?, throwingMechanics = ?, throwingMechanicsNotes = ?, armStrength = ?, " +
        "armStrengthNotes = ?, armAccuracy = ?, armAccuracyNotes = ?, inField = ?, inFieldNotes = ?, outField = ?, " +
        "outFieldNotes = ?, baserunMechanics = ?, baserunMechanicsNotes = ?, baserunSpeed = ?, baserunSpeedNotes = ?, " +
        "updatedAt = NOW() WHERE leagueId = UNHEX(?) AND playerId = UNHEX(?) AND id = UNHEX(?) AND coachId = " +
        "UNHEX(?) LIMIT 1";
      data = [
        req.body.hittingMechanics,
        req.body.hittingMechanicsNotes,
  			req.body.batSpeed,
        req.body.batSpeedNotes,
        req.body.batContact,
        req.body.batContactNotes,
        req.body.throwingMechanics,
        req.body.throwingMechanicsNotes,
  			req.body.armStrength,
        req.body.armStrengthNotes,
        req.body.armAccuracy,
        req.body.armAccuracyNotes,
        req.body.inField,
        req.body.inFieldNotes,
        req.body.outField,
        req.body.outFieldNotes,
        req.body.baserunMechanics,
        req.body.baserunMechanicsNotes,
        req.body.baserunSpeed,
        req.body.baserunSpeedNotes,
        req.body.leagueId,
        req.body.playerId,
        req.params.id,
        req.user.id
      ];
    } else {
      query = "INSERT INTO formulas SET id = UNHEX(?), coachId = UNHEX(?), playerId = UNHEX(?), leagueId = UNHEX(?), " +
        "hittingMechanics = ?, hittingMechanicsNotes = ?, batSpeed = ?, batSpeedNotes = ?, batContact = ?, " +
        "batContactNotes = ?, throwingMechanics = ?, throwingMechanicsNotes = ?, armStrength = ?, armStrengthNotes = ?, " +
        "armAccuracy = ?, armAccuracyNotes = ?, inField = ?, inFieldNotes = ?, outField = ?, outFieldNotes = ?, " +
        "baserunMechanics = ?, baserunMechanicsNotes = ?, baserunSpeed = ?, baserunSpeedNotes = ?, " +
        "updatedAt = NOW(), createdAt = NOW()";
      data = [
        uuid().replace(/\-/g, ""),
        req.user.id,
        req.body.playerId,
        req.body.leagueId,
        req.body.hittingMechanics,
        req.body.hittingMechanicsNotes,
  			req.body.batSpeed,
        req.body.batSpeedNotes,
        req.body.batContact,
        req.body.batContactNotes,
        req.body.throwingMechanics,
        req.body.throwingMechanicsNotes,
  			req.body.armStrength,
        req.body.armStrengthNotes,
        req.body.armAccuracy,
        req.body.armAccuracyNotes,
        req.body.inField,
        req.body.inFieldNotes,
        req.body.outField,
        req.body.outFieldNotes,
        req.body.baserunMechanics,
        req.body.baserunMechanicsNotes,
        req.body.baserunSpeed,
        req.body.baserunSpeedNotes
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
      const query = "DELETE FROM stats WHERE id = UNHEX(?) AND coachId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
