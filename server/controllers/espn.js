const 	getConnection 	= require("../config/mysql"),
		Promise 		= require("bluebird"),
		uuid 			= require('uuid/v1'),
		jwt 			= require("jsonwebtoken"),
		jwtKey 			= require("../../keys/keys").jwtKey,
		bcrypt 			= Promise.promisifyAll(require("bcrypt")),

		using 			= Promise.using;

module.exports = {
    update: (req, res) => {

    }
}
