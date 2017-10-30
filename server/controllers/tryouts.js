const Promise = require("bluebird");
const uuid = require('uuid/v1');

const getConnection = require("../config/mysql");


module.exports = {
  tryouts: (req, res) => {
    let tempTryouts = []
    if (req.body.dates.length > 5)
      return res.status(400).json({ message: "Only up to 5 tryout dates are allowed." });

    if (req.body.address) {
      for (var i = 0; i < req.body.dates.length; i++)
        tempTryouts[i] = [req.body.dates[i], req.body.address];
        tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        tempTryouts[i].push(new Buffer(req.user.id, "hex"));
        tempTryouts[i].push("NOW()");
        tempTryouts[i].push("NOW()");
    } else {
      for (var i = 0; i < req.body.dates.length; i++)
        tempTryouts[i] = [req.body.dates[i].date, req.body.dates[i].address];
        tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        tempTryouts[i].push(new Buffer(req.user.id, "hex"));
        tempTryouts[i].push("NOW()");
        tempTryouts[i].push("NOW()");
    }
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM tryouts WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [requser.id]);
    }).spread(data => {
      const query = "INSERT INTO tryouts (date, address, id, leagueId, createdAt, updatedAt) VALUES ?"
      return Promise.using(getConnection(), connection => connection.execute(query, data));
    }).then(() => res.end())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin." });
      });
	},
  getTryouts: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT date, address, createdAt, updatedAt FROM tryouts WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
