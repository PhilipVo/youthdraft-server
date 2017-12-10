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
    const divisionHash = {}, coachUUID = {}, passwords = [], coachPasswords = {}, playersHash = {};
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
    req.body.password = generator.generate({ length: 10, strict: true, numbers: true  });

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
        const tempSplice = players[key].birthday.split("/")
        players[key].birthday = "20" + tempSplice[2] + "-" + tempSplice[0] + "-" + tempSplice[1]
        tempPlayer.push(players[key].firstname);
        tempPlayer.push(players[key].lastname);
        tempPlayer.push(players[key].leagueage);
        tempPlayer.push(players[key].birthday);
        tempPlayer.push(players[key].jersey);
        tempPlayer.push(0);
        tempPlayer.push(new Buffer(tempId, "hex"));
        tempPlayer.push(new Buffer(leagueId, "hex"));
        tempPlayer.push("NOW()");
        tempPlayer.push("NOW()");
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
        tempPlayer.push("0001-01-01");
        tempPlayer.push(players[key].jersey);
        tempPlayer.push(players[key].coachsKid);
        tempPlayer.push(new Buffer(tempId, "hex"));
        tempPlayer.push(new Buffer(leagueId, "hex"));
        tempPlayer.push("NOW()");
        tempPlayer.push("NOW()");
        playersHash[players[key].leagueid] = tempId;
        req.body.players.push(tempPlayer);
      }
    }

    for (const key in dataExport.users) {
      // Email Address
      // Coach id
      // League id
      if (dataExport.users[key].strut.email) {
        const tempCoach = [];
        const tempId = uuid().replace(/\-/g, "");
        const tempPassword = generator.generate({ length: 10, strict: true, numbers: true  })
        tempCoach.push(dataExport.users[key].strut.email);
        coachPasswords[dataExport.users[key].strut.email] = tempPassword;
        passwords.push(tempPassword);
        tempCoach.push(new Buffer(tempId, "hex"));
        coachUUID[key] = tempId;
        tempCoach.push(new Buffer(leagueId, "hex"));
        tempCoach.push("NOW()");
        tempCoach.push("NOW()");
        tempCoach.push(1);
        req.body.coaches.push(tempCoach);
        if (dataExport.users[key].strut.ranked && dataExport.users[key].strut.ranked.Baseball) {
          const tempEvals = dataExport.users[key].strut.ranked.Baseball
          for (yearKey in tempEvals) {
            for (playerKey in tempEvals[yearKey]) {
              // throwingMechanics
              // armStrength
              // armAccuracy
              // hittingMechanics
              // batSpeed
              // batContact
              // inField
              // outField
              // baserunMechanics
              // baserunSpeed
              // Eval id
              // Player id
              // Coach id
              if (playersHash[playerKey]) {
                const tempEval = []
                const playerEval = tempEvals[yearKey][playerKey]
                if (playerEval.pthrow)
                  tempEval.push(playerEval.pthrow)
                else
                  tempEval.push(0)
                if (playerEval.parm) {
                  tempEval.push(playerEval.parm)
                  tempEval.push(playerEval.parm)
                } else {
                  tempEval.push(0)
                  tempEval.push(0)
                }
                if (playerEval.phit)
                  tempEval.push(playerEval.phit)
                else
                  tempEval.push(0)
                if (playerEval.pbat) {
                  tempEval.push(playerEval.pbat)
                  tempEval.push(playerEval.pbat)
                } else {
                  tempEval.push(0)
                  tempEval.push(0)
                }
                if (playerEval.pinfield)
                  tempEval.push(playerEval.pinfield)
                else
                  tempEval.push(0)
                if (playerEval.poutfield)
                  tempEval.push(playerEval.poutfield)
                else
                  tempEval.push(0)
                if (playerEval.pbase)
                  tempEval.push(playerEval.pbase)
                else
                  tempEval.push(0)
                if (playerEval.pspeed)
                  tempEval.push(playerEval.pspeed)
                else
                  tempEval.push(0)

                tempEval.push("UNHEX(REPLACE(UUID(), '-', ''))");
                tempEval.push(new Buffer(playersHash[playerKey], "hex"));
                tempEval.push(new Buffer(tempId, "hex"));
                if(key == "spring2017") {
                  tempEval.push("2017-01-01");
                  tempEval.push("2017-01-01");
                } else {
                  tempEval.push("2016-01-01");
                  tempEval.push("2016-01-01");
                }
                req.body.stats.push(tempEval)
              }
            }
          }
        }
      }
    }

    bcrypt.genSaltAsync(10)
      .then(salt => bcrypt.hashAsync(req.body.password, salt))
      .then(hash => Promise.using(getConnection(), connection => {
        const data = [leagueId, req.body.email, req.body.firstName, req.body.lastName, req.body.leagueName, req.body.phoneNumber, req.body.city, req.body.state, hash];
        const query = "INSERT INTO leagues SET id = UNHEX(?), email = ?, firstName = ?, lastName = ?, isLive = 1, " +
          "leagueName = ?, phoneNumber = ?, city = ?, state = ?, createdAt = NOW(), password = ?, updatedAt = NOW()";
        return connection.execute(query, data)
      })).then(() => Promise.map(passwords, function(password) {
        return bcrypt.hashAsync(password, 10)
      })).then(hashes => {
        for (let i = 0; i < hashes.length; i++) {
          req.body.coaches[i].push(hashes[i])
        }
        if (req.body.coaches.length > 0) {
          const query = "INSERT INTO coaches (email, id, leagueId, createdAt, updatedAt, validated, password) VALUES ?"
          return Promise.using(getConnection(), connection => connection.query(query, [req.body.coaches]));
        }
        else return Promise.resolve();
      }).then(() => {
        if (req.body.players.length > 0) {
          const query = "INSERT INTO players (firstName, lastName, leagueAge, birthday, teamNumber, coachsKid, " +
            "id, leagueId, createdAt, updatedAt) VALUES ?";
          return Promise.using(getConnection(), connection => connection.query(query, [req.body.players]));
        }
        else return Promise.resolve();
      }).then(() => {
        if (req.body.stats.length > 0) {
          const query = "INSERT INTO stats (throwingMechanics, armStrength, armAccuracy, hittingMechanics, " +
            "batSpeed, batContact, inField, outField, baserunMechanics, baserunSpeed, id, playerId, coachId, " +
            "createdAt, updatedAt) VALUES ?";
          return Promise.using(getConnection(), connection => connection.query(query, [req.body.stats]));
        }
        else return Promise.resolve();
      }).then(() => {
        let html = `<span style="padding-left:2em;display:block">` + req.body.email + `:` + req.body.password + `</span>`
        for (let key in coachPasswords) {
          html += `<span style="padding-left:2em;display:block">` + key + `:` + coachPasswords[key] + `</span>`
        }
        nodeMailer.mailOptions.to = serverKeys.smtp
        nodeMailer.mailOptions.subject = "Tassajara Valley Little League Passwords"
        nodeMailer.mailOptions.html = html
        return nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
      }).then(() => res.status(200).json({ message: "Works" }))
      .catch(error => {
        if (error.status)
          return res.status(error.status).json({ message: error.message });
        if (error["code"] == "ER_DUP_ENTRY")
  				return res.status(400).json({ message: "This league already exists." });
        return res.status(400).json({message: "Please contact an admin.", error: error});
      });
	}
}
