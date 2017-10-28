const mysql = require('mysql2/promise');
const password = require('../../keys/keys').mysqlPassword;
const Promise = require('bluebird');
const SqlString = require('sqlstring');

const using = Promise.using;

const pool = mysql.createPool({
	host: 'localhost',
	port: '8889', //3306,
	user: 'root',
	password: password,
	database: 'gametime',
	queryFormat: queryFormat,
	Promise: Promise
});

function getConnection() {
	return pool.getConnection().disposer(function (connection) {
		connection.release();
	});
}

module.exports = getConnection;
