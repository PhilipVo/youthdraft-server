const Promise = require("bluebird");
const uuid = require('uuid/v1');
const xlsxConverter = require('../services/xlsxConverter');

const getConnection = require("../config/mysql");


module.exports = {
  uploadCoaches: (req, res) => {
    xlsxConverter('sample.xlsx').then(jsonArray => {
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
          const query = "INSERT INTO coaches (firstName, lastName, division, email, phoneNumber, " +
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
  getCoaches: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT HEX(id) as id, firstName, lastName, email, division, phoneNumber, createdAt, " +
        "updatedAt, HEX(leagueId) as leagueId FROM coaches WHERE leagueId = UNHEX(?)";
      return connection.execute(query, [req.user.id]);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	},
  coaches: (req, res) => {
    let query2, data2
    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.phoneNumber ||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate email:
		// if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

    //Setup the first query
    const query1 = "SELECT email FROM coaches WHERE email = ? AND leagueId = UNHEX(?) LIMIT 1";
    const data1 = [req.body.email]

    // Check if it's updating or if it's creating by seeing if there is an id
    if (req.params.id) {
      query2 = "UPDATE coaches SET email = ?, firstName = ?, lastName = ?, phoneNumber = ?, " +
        "city = ?, state = ?, updatedAt = NOW() WHERE id = UNHEX(?) and leagueId = UNHEX(?) LIMIT 1";
      data2 = [req.body.email, req.body.firstName, req.body.lastName, req.body.phoneNumber, req.body.city, req.body.state, req.body.id, req.params.id];
    } else {
      query2 = "INSERT INTO coaches SET id = ?, email = ?, firstName = ?, lastName = ?, phoneNumber = ?, " +
        "city = ?, state = ?, updatedAt = NOW(), createdAt = NOW()";
      data2 = [uuid().replace(/\-/g, ""), req.body.email, req.body.firstName, req.body.lastName, req.body.phoneNumber, req.body.city, req.body.state, req.user.id];
    }
    Promise.using(getConnection(), connection => {
      // Check if unique email entered:
      return connection.execute(query1, data1);
    }).spread(user => {
      if (user.length === 1 && user[0].email !== req.body.email)
        throw { status: 400, message: 'Email already in use.' }

      return Promise.using(getConnection(), connection => connection.execute(query2, data2));
    }).then(() => res.end())
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        return res.status(400).json({ message: "Please contact an admin." });
      });
	},
  validateCoaches: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "UPDATE coaches SET isValidated = 1 , updatedAt = NOW() WHERE id = UNHEX(?) AND leagueId = UNHEX(?) LIMIT 1";
      return connection.execute(query, [req.body.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
  },
  deleteCoaches: (req, res) => {
    // Just incase the id is not sent over for whatever reason
    if (!req.params.id)
      return res.status(400).json({ message: "Was unable to delete the coach, please try again." });
    Promise.using(getConnection(), connection => {
      const query = "DELETE FROM coaches WHERE id = UNHEX(?) AND leagueId = UNHEX(?)";
      return connection.execute(query, [req.params.id, req.user.id]);
    }).spread(data => res.status(200).json())
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
