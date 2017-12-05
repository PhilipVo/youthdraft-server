const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");

const maxTryouts = 8


module.exports = {
  modify: (req, res) => {
    if (req.user.leagueId) {
      return res.status(400).json({ message: "Only a league admin can add, remove, or modify a tryout date."});
    }
    let tempTryouts = []
    let tempIds = []
    if (req.body.tryouts.length > maxTryouts)
      return res.status(400).json({ message: "Only up to" + maxTryouts + "tryout dates are allowed." });

    for (var i = 0; i < req.body.tryouts.length; i++) {
      if (!req.body.tryouts[i].date || !req.body.tryouts[i].address) {
        return res.status(400).json({ message: "Tryouts need both a date and an address." });
      }
      if (!/^\(?([0-9]{4})\)?[- ]?(0?[1-9]|1[0-2])[- ]?(0?[1-9]|[12]\d|30|31)[ T](0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[0-6]\d)?Z?$/.test(req.body.tryouts[i].date)) {
        return res.status(400).json({ message: "Tryout times should be in the format of YYYY-MM-DD HH:MM."});
      }
      tempTryouts[i] = [req.body.tryouts[i].date, req.body.tryouts[i].address];
      if (req.body.tryouts[i].id) {
        tempIds.push(new Buffer(req.body.tryouts[i].id, "hex"))
        tempTryouts[i].push(new Buffer(req.body.tryouts[i].id, "hex"))
      } else {
        tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
      }
      tempTryouts[i].push(new Buffer(req.user.id, "hex"));
      tempTryouts[i].push("NOW()");
      tempTryouts[i].push("NOW()");
    }

    Promise.using(getConnection(), connection => {
      let query = ""
      const data = [req.user.id]
      if (tempIds.length == 0) {
        query = "DELETE FROM tryouts WHERE leagueId = UNHEX(?)";
      } else {
        query = "DELETE FROM tryouts WHERE leagueId = UNHEX(?) && id NOT IN ?";
        data.push([tempIds])
      }
      console.log(tempIds);
      console.log(query);
      return connection.query(query, data);
    }).spread(data => {
      if (tempTryouts.length > 0) {
        const query = "INSERT INTO tryouts (date, address, id, leagueId, createdAt, updatedAt) VALUES ? " +
          "ON DUPLICATE KEY UPDATE date = VALUES(date), address = VALUES(address), updatedAt = NOW();"
        console.log(query);
        console.log(tempTryouts);
        return Promise.using(getConnection(), connection => connection.query(query, [tempTryouts]));
      }
      return Promise.resolve();
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
      const query = "SELECT HEX(id) as id, date, address, createdAt, updatedAt FROM tryouts WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [tempId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
