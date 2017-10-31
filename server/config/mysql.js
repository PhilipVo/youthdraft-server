const mysql = require('mysql2/promise');
const password = require('../../keys/keys').mysqlPassword;
const Promise = require('bluebird');
const SqlString = require('sqlstring');

const using = Promise.using;
//
// function queryFormat(sql, values, timeZone) {
// 	sql = SqlString.format(sql, values, false, timeZone);
// 	sql = sql.replace(/'NOW\(\)'/g, "NOW()")
// 		.replace(/'UNHEX\(REPLACE\(UUID\(\), \\'-\\', \\'\\'\)\)'/g, "UNHEX(REPLACE(UUID(), '-', ''))")
// 		.replace(/'UNHEX\('/g, "UNHEX(")
// 		.replace(/'\)'/g, "')")
// 		.replace(/\\/g, "");
// 	return sql;
// };

const pool = mysql.createPool({
	host: 'localhost',
	port: '8889', //3306,
	user: 'root',
	password: password,
	database: 'youthdraft',
	// queryFormat: queryFormat,m
	Promise: Promise
});

function getConnection() {
	return pool.getConnection().disposer(function (connection) {
		connection.release();
	});
}

module.exports = getConnection;
