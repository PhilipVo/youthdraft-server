var connection = require('../config/db.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var cert = require('../../keys').jwtKey;
const uuid = require('uuid/v1');

function UserModel(){

	this.get_user = function(user, callback) {
		const data = [user.id, user.loginAt];
		connection.query("SELECT username, email, firstName, lastName, teams FROM gametime.users where id = UNHEX(REPLACE(?, '-', '')) and loginAt = ?", data, function (err, result) {
			if(err){
				callback({error: true, errors: err});
			}
			else {
				if (result[0]) {
					result[0].teams = JSON.parse(result[0].teams)
					callback({error: false, data: result[0]});
				} else {
					callback({error: true, errors: "Please login"});
				}
			}
		});
	}

	this.create_user = function(user, callback) {
		let err = {};
		if(!user.email) {
			err.email = "Email is required";
		}
		else if(!/[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+/.test(user.email)) {
			err.email = "Invalid email address";
		}
		connection.query('SELECT id FROM users WHERE email = ?', [user.email], function(error, result) {
			if(result.length > 0) {
				err.email = "Email already exist, please use another one";
			}
			if(!user.password) {
				err.password = "Password is required";
			}
			else if(user.password.length < 8) {
				err.password = "Password needs at least 8 characters";
			}
			if(JSON.stringify(err) !== '{}') {
				callback({error: true, errors: err});
				return;
			}
			user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8));
			user.id = uuid()
			user.loginAt = Date.now()
			var data = [user.id, user.username, user.firstName, user.lastName, user.email, user.teams, user.password, user.loginAt];
			connection.query("INSERT INTO users SET id = UNHEX(REPLACE(?, '-', '')), username = ?, firstName = ?, lastName = ?, email = ?, teams = ?, password = ?, createdAt = NOW(), updatedAt = NOW(), loginAt = ?", data, function(error, result) {
				if(error){
					callback({error: true, errors: error});
				}
				else {
					jwt.sign({ id: user.id, loginAt: user.loginAt, iat: Math.floor(Date.now() / 1000) - 30 }, cert, function(err, token) {
						callback({error: false, data: result[0], token: token});
					});
				}
			});
		});
	};

	this.update_user = function(token, user, callback) {
		var err = {};
		if(!user.email) {
			err.email = "Email is required";
		}
		else if(!/[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+/.test(user.email)) {
			err.email = "Invalid email address";
		}
		if(JSON.stringify(err) !== '{}') {
			callback({error: true, errors: err});
			return;
		}
		const teamString = JSON.stringify(user.teams)
		const data = [user.username, user.firstName, user.lastName, user.email, teamString, token.id, token.loginAt];
		connection.query("UPDATE users SET username = ?, firstName = ?, lastName = ?, email = ?, teams = ?, updatedAt = NOW() WHERE id = UNHEX(REPLACE(?, '-', '')) and loginAt = ?", data, function(err, result) {
			if(err){
				callback({error: true, errors: err});
			}
			else {
				callback({error: false, data: result});
			}
		});
	}

	this.delete_user = function(id, callback) {
		connection.query("DELETE FROM users WHERE id = ?", [id], function (err, result) {
			if(err){
				callback({error: true, errors: err});
			}
			else {
				callback({error: false, data: result[0]});
			}
		});
	}

	this.login_user = function(user, callback) {
		var err = {};
		if(!user.email) {
			err.email = "Email is required";
		}
		if(!user.password) {
			err.password = "Password is required";
		}
		if(JSON.stringify(err) !== '{}') {
			callback({error: true, errors: err});
			return;
		}
		connection.query("SELECT HEX(id) AS id, username, email, firstName, lastName, password, teams, loginAt FROM users WHERE email = ?", [user.email], function (error, result) {
			if(result.length < 1) {
				err.email = "Email address and password don't match";
			}
			else if(!bcrypt.compareSync(user.password, result[0].password)) {
				err.email = "Email address and password don't match";
			}
			if(JSON.stringify(err) !== '{}') {
				callback({error: true, errors: err});
				return;
			}
			var reducedResults
			if (result[0]) {
				reducedResults = {
					username: result[0].username,
			        email: result[0].email,
			        firstName: result[0].firstName,
			        lastName: result[0].lastName,
			        teams: JSON.parse(result[0].teams),
				}
			}
			jwt.sign({ id: result[0].id, loginAt: result[0].loginAt, iat: Math.floor(Date.now() / 1000) - 30 }, cert, function(err, token) {
				callback({error: false, data: reducedResults, token: token});
			});
		});
	}

	this.logout_user = function(user, callback) {
		var data = [Date.now(), user.id]
		connection.query("UPDATE users SET loginAt = ? WHERE id = UNHEX(REPLACE(?, '-', ''))", data, function(err, result) {
			if(err){
				callback({error: true, errors: err});
			}
			else {
				callback({error: false, data: result});
			}
		});
	}
}

module.exports = new UserModel();
