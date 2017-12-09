const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const uuid = require('uuid/v1');
const generator = require('generate-password');
const xlsxConverter = require('../services/xlsx-converter');
const fs = require('file-system');

const jwtKey = require("../../keys/keys").jwtKey;
const serverKeys = require("../../keys/keys");
const getConnection = require("../config/mysql");
const nodeMailer = require('../config/nodemailer');
const dataExport = require('../../export.json');

module.exports = {
  createTest: (req, res) => {
    const divisionHash = {}, coachUUID = {}, coachPasswords = {}, playersHash = {};
    let divisionString = "";

    req.body.email = "chris@youthdraft.com"
    req.body.firstName = "Chris"
    req.body.lastName = "Thompson"
    req.body.leagueName = "Tassajara Valley Little League"
    req.body.phoneNumber = ""
    req.body.city = "Danville"
    req.body.state = "CA"
    req.body.coaches = [];
    req.body.players = [];
    req.body.stats = [];

    const leagueId = uuid().replace(/\-/g, "");

    let players = dataExport.league.id.strut.sport.Baseball.Spring2016.players

    for (const key in players) {
      // First Name
      // Last Name
      // League Age
      // Birthday
      // Team Number
      // Coach's Kid
      // Player id
      // League id
      if (players[key] && players[key].firstname) {
        const tempPlayer = [];
        const tempId = uuid().replace(/\-/g, "");
        tempPlayer.push(players[key].firstname);
        tempPlayer.push(players[key].lastname);
        tempPlayer.push(players[key].leagueage);
        tempPlayer.push(players[key].birthday);
        tempPlayer.push(players[key].jersey);
        tempPlayer.push("");
        tempPlayer.push(tempId);
        tempPlayer.push(leagueId);
        playersHash[players[key].leagueid] = tempId;
        req.body.players.push(tempPlayer);
      }
    }

    players = dataExport.league.id.strut.sport.Baseball.Spring2017.players

    for (const key in players) {
      // First Name
      // Last Name
      // League Age
      // Birthday
      // Team Number
      // Coach's Kid
      // Player id
      // League id
      if (players[key] && players[key].firstname) {
        const tempPlayer = [];
        const tempId = uuid().replace(/\-/g, "");
        tempPlayer.push(players[key].firstname);
        tempPlayer.push(players[key].lastname);
        tempPlayer.push(players[key].leagueage);
        tempPlayer.push("");
        tempPlayer.push(players[key].jersey);
        tempPlayer.push(players[key].coachsKid);
        tempPlayer.push(tempId);
        tempPlayer.push(leagueId);
        playersHash[players[key].leagueid] = tempId;
        req.body.players.push(tempPlayer);
      }
    }

    console.log(playersHash);

    for (const key in dataExport.users) {
      // Email Address
      // Password
      // Coach id
      // League id
      if (dataExport.users[key].strut.email) {
        const tempCoach = [];
        const tempId = uuid().replace(/\-/g, "");
        const tempPassword = generator.generate({ length: 10, strict: true, numbers: true  })
        tempCoach.push(dataExport.users[key].strut.email);
        coachPasswords[dataExport.users[key].strut.email] = tempPassword;
        tempCoach.push(tempPassword);
        tempCoach.push(tempId);
        coachUUID[key] = tempId;
        tempCoach.push(leagueId);
        req.body.coaches.push(tempCoach);
        if (dataExport.users[key].strut.ranked.Baseball) {
          const tempEval = dataExport.users[key].strut.ranked.Baseball
          for (yearKey in tempEval) {
            for (playerKey in tempEval[yearKey]) {
              
            }
          }
        }
      }
    }

    return res.status(400).json(req.body);
	}
}
