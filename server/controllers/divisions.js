const Promise = require("bluebird");

const getConnection = require("../config/mysql");


module.exports = {
  getAll: (req, res) => {
    Promise.using(getConnection(), connection => {
      const query = "SELECT * FROM divisions";
      return connection.execute(query);
    }).spread(data => res.status(200).json(data))
      .catch(error => res.status(400).json({ message: "Please contact an admin." }));
	}
}
