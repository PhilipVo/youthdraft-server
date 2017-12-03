const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  getAll: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can view formulas." })
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, title, hittingMechanics, batSpeed, batContact, throwingMechanics, armStrength, " +
      "armAccuracy, inField, outField, baserunMechanics, baserunSpeed, createdAt, updatedAt FROM formulas WHERE " +
      "coachId = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id, req.user.leagueId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  formulas: (req, res) => {
    if (!req.user.leagueId) {
      return res.status(400).json({ message: "Only coaches can change formulas." })
    }
    let query2, data2 = [], addedQuery = false;
    const id = uuid().replace(/\-/g, "");

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query2 = "UPDATE formulas SET ";
    } else {
      query2 = "INSERT INTO formulas SET id = UNHEX(?), coachId = UNHEX(?), leagueId = UNHEX(?),";
      data2 = [
        id,
        req.user.id,
        req.user.leagueId
      ];
    }
    if (req.body.title) {
      addedQuery = true;
      query2 += " title = ?";
      data2.push(req.body.title);
    }
    if (req.body.hittingMechanics) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " hittingMechanics = ?";
      data2.push(req.body.hittingMechanics);
    }
    if (req.body.batSpeed) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " batSpeed = ?";
      data2.push(req.body.batSpeed);
    }
    if (req.body.batContact) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " batContact = ?";
      data2.push(req.body.batContact);
    }
    if (req.body.throwingMechanics) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " throwingMechanics = ?";
      data2.push(req.body.throwingMechanics);
    }
    if (req.body.armStrength) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " armStrength = ?";
      data2.push(req.body.armStrength);
    }
    if (req.body.armAccuracy) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " armAccuracy = ?";
      data2.push(req.body.armAccuracy);
    }
    if (req.body.inField) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " inField = ?";
      data2.push(req.body.inField);
    }
    if (req.body.outField) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " outField = ?";
      data2.push(req.body.outField);
    }
    if (req.body.baserunMechanics) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " baserunMechanics = ?";
      data2.push(req.body.baserunMechanics);
    }
    if (req.body.baserunSpeed) {
      if (addedQuery) {
        query2 += ","
      }
      addedQuery = true;
      query2 += " baserunSpeed = ?";
      data2.push(req.body.baserunSpeed);
    }
    if (!addedQuery) {
      return res.status(400).json({ message: "Please fillout your formula before submitting" });
    }
    if (req.params.id) {
      query2 += ", updatedAt = NOW() WHERE id = UNHEX(?) AND coachId = UNHEX(?) AND leagueId = UNHEX(?) LIMIT 1";
      data2.push(req.params.id)
      data2.push(req.user.id)
      data2.push(req.user.leagueId)
    } else {
      query2 += ", updatedAt = NOW(), createdAt = NOW()";
    }
    Promise.using(getConnection(), connection => {
      const query2 = "SELECT * FROM formulas WHERE coachId = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query2, [req.user.id, req.user.leagueId]);
    }).spread(data => {
      if (data.length > 4 && !req.params.id) {
        throw { status: 400, message: 'You already have five formulas.  Please delete one before adding more'}
      }
      console.log(query2);
      console.log(data2);
      return Promise.using(getConnection(), connection => connection.execute(query2, data2))
    })
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
      return res.status(400).json({ message: "Only coaches can delete formulas." })
    }
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM formulas WHERE id = UNHEX(?) AND coachId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
