const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsx-converter');

const getConnection = require("../config/mysql");

module.exports = {
  upload: (req, res) => {
    xlsxConverter("./" + req.file.path).then(jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        if (jsonArray[i].length < 5) {
          return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        }
        if (jsonArray[i].length > 5) {
          jsonArray[i].splice(5)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(req.user.id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      Promise.using(getConnection(), connection => {
        if (jsonArray.length > 0) {
          const query = "INSERT INTO teams (firstName, lastName, division, email, phoneNumber, " +
            "id, leagueId, createdAt, updatedAt) VALUES ?"
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
  getAll: (req, res) => {
    let tempId = req.user.id
    if (req.user.leagueId) {
      tempId = req.user.leagueId
    }
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, name, division, createdAt, updatedAt FROM teams WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [tempId]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  teams: (req, res) => {
    let query, data
    // Expecting all form data.
		if (
			!req.body.name ||
			!req.body.division
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query = "UPDATE teams SET name = ?, division = ?, updatedAt = NOW() WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
      data = [
        req.body.name,
        req.body.division,
        req.params.id,
        req.user.id
      ];
    } else {
      query = "INSERT INTO teams SET id = UNHEX(?), leagueId = UNHEX(?), name = ?, division = ?, updatedAt = NOW(), createdAt = NOW()";
      data = [
        uuid().replace(/\-/g, ""),
        req.user.id,
        req.body.name,
        req.body.division
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
      const query = "DELETE FROM teams WHERE id = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
