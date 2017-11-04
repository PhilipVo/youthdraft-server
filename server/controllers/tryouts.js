const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  modify: (req, res) => {
    let tempTryouts = []
    if (req.body.tryouts.length > 5)
      return res.status(400).json({ message: "Only up to 5 tryout dates are allowed." });

    for (var i = 0; i < req.body.tryouts.length; i++) {
      if (!req.body.tryouts[i].date || !req.body.tryouts[i].address) {
        return res.status(400).json({ message: "Tryouts need both a date and an address." });
      }
      tempTryouts[i] = [req.body.tryouts[i].date, req.body.tryouts[i].address];
      tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
      tempTryouts[i].push(new Buffer(req.user.id, "hex"));
      tempTryouts[i].push("NOW()");
      tempTryouts[i].push("NOW()");
    }

    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM tryouts WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id]);
    }).spread(data => {
      const query = "INSERT INTO tryouts (date, address, id, leagueId, createdAt, updatedAt) VALUES ?"
      return Promise.using(getConnection(), connection => connection.query(query, [tempTryouts]));
    }).then(() => res.end())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin.", error: error , tempTryouts: tempTryouts});
      });
	},
  getAll: (req, res) => {
    let tempId = req.user.id
    if (req.user.leagueId) {
      tempId = req.user.leagueId
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT date, address, createdAt, updatedAt FROM tryouts WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [tempId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
