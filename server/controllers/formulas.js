const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  getAll: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT * FROM formulas WHERE coachId = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id, req.user.leagueId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  formulas: (req, res) => {
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
			return res.status(400).json({ message: "All form fields are required." });

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query = "UPDATE formulas SET hittingMechanics = ?, batSpeed = ?, batContact = ?, throwingMechanics = ?, " +
        "armStrength = ?, armAccuracy = ?, inField = ?, outField = ?, baserunMechanics = ?, baserunSpeed = ?, " +
        "updatedAt = NOW() WHERE leagueId = UNHEX(?) AND id = UNHEX(?) AND coachId = UNHEX(?) LIMIT 1";
      data = [
        req.body.hittingMechanics,
  			req.body.batSpeed,
        req.body.batContact,
        req.body.throwingMechanics,
  			req.body.armStrength,
        req.body.armAccuracy,
        req.body.inField,
        req.body.outField,
        req.body.baserunMechanics,
        req.body.baserunSpeed,
        req.body.leagueId,
        req.params.id,
        req.user.id
      ];
    } else {
      query = "INSERT INTO formulas SET id = UNHEX(?), coachId = UNHEX(?), leagueId = UNHEX(?), " +
        "hittingMechanics = ?, batSpeed = ?, batContact = ?, throwingMechanics = ?, armStrength = ?, " +
        "armAccuracy = ?, inField = ?, outField = ?, baserunMechanics = ?, baserunSpeed = ?, " +
        "updatedAt = NOW(), createdAt = NOW()";
      data = [
        uuid().replace(/\-/g, ""),
        req.user.id,
        req.body.leagueId,
        req.body.hittingMechanics,
  			req.body.batSpeed,
        req.body.batContact,
        req.body.throwingMechanics,
  			req.body.armStrength,
        req.body.armAccuracy,
        req.body.inField,
        req.body.outField,
        req.body.baserunMechanics,
        req.body.baserunSpeed
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
      const query = "DELETE FROM formulas WHERE id = UNHEX(?) AND coachId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
