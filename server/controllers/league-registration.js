const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const uuid = require('uuid/v1');
const generator = require('generate-password');
const xlsxConverter = require('../services/xlsx-converter');

const jwtKey = require("../../keys/keys").jwtKey;
const serverKeys = require("../../keys/keys");
const getConnection = require("../config/mysql");
const nodeMailer = require('../config/nodemailer');

module.exports = {
  tester: (req, res) => {
    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.leagueName ||
			!req.body.phoneNumber ||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate phone number as XXX-XXX-XXXX:
    if (!/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/.test(req.body.phoneNumber))
      return res.status(400).json({ message: "Invalid phone number. Phone number format should be: XXX-XXX-XXXX." });

		// Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

		const id = uuid().replace(/\-/g, "");

    let tempTryouts = []
    if (req.body.tryouts.length > 5)
      return res.status(400).json({ message: "Only up to 5 tryout dates are allowed." });

    for (var i = 0; i < req.body.tryouts.length; i++) {
      if (!req.body.tryouts[i].date || !req.body.tryouts[i].address) {
        return res.status(400).json({ message: "Tryouts need both a date and an address." });
      }
      tempTryouts[i] = [req.body.tryouts[i].date, req.body.tryouts[i].address];
      tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
      tempTryouts[i].push(new Buffer(id, "hex"));
      tempTryouts[i].push("NOW()");
      tempTryouts[i].push("NOW()");
    }
    req.body.tryouts = tempTryouts;

    if (!req.files.players || !req.files.coaches || !req.files.teams)
      return res.status(400).json({message: "Please try uploading your .csv or .xlsx file for players again"})

    xlsxConverter("./" + req.files.teams[0].path).then(jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        // if (jsonArray[i].length < 5) {
        //   return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        // }
        console.log({index: i, length: tempLength});
        if (jsonArray[i].length > 5) {
          jsonArray[i].splice(5)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.teams = jsonArray
      return Promise.resolve();
    }).then(() => xlsxConverter("./" + req.files.players[0].path))
    .then( jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        // if (jsonArray[i].length < 13) {
        //   return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        // }
        console.log({index: i, length: tempLength});
        if (jsonArray[i].length > 13) {
          jsonArray[i].splice(13)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.players = jsonArray
      return Promise.resolve();
    }).then(() => xlsxConverter("./" + req.files.coaches[0].path))
    .then( jsonArray => {
      const tempLength = jsonArray.length;
      for (var i = 0; i < tempLength; i++) {
        // if (jsonArray[i].length < 13) {
        //   return res.status(400).json({message: "Please check your spreadsheet, you are missing a column."});
        // }
        if (jsonArray[i].length > 13) {
          jsonArray[i].splice(13)
        }
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.coaches = jsonArray
      return res.status(200).json(req.body)
    }).catch(error => {
      return res.status(400).json({error: error});
    });
  },
  register: (req, res) => {
		// Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.leagueName ||
			!req.body.phoneNumber ||
			!req.body.city ||
      !req.body.state
		)
			return res.status(400).json({ message: "All form fields are required." });

    // Validate phone number as XXX-XXX-XXXX:
    if (!/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/.test(req.body.phoneNumber))
      return res.status(400).json({ message: "Invalid phone number. Phone number format should be: XXX-XXX-XXXX." });

		// Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email))
			return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });

		const id = uuid().replace(/\-/g, "");

		Promise.using(getConnection(), connection => {
			const data = [id, req.body.email, req.body.firstName, req.body.lastName, req.body.leagueName, req.body.phoneNumber, req.body.city, req.body.state];
			const query = "INSERT INTO leagues SET id = UNHEX(?), email = ?, firstName = ?, lastName = ?, isLive = 0, " +
				"leagueName = ?, phoneNumber = ?, city = ?, state = ?, createdAt = NOW(), updatedAt = NOW()";
			return connection.execute(query, data);
		}).spread(data => {
      const youthDraftToken = jwt.sign({
				id: id,
        youthdraftKey: serverKeys.youthdraftKey,
				iat: Math.floor(Date.now() / 1000) - 30
			}, jwtKey);
      // url/accept and url/decline
      nodeMailer.mailOptions.to = serverKeys.youthdraftEmail
      nodeMailer.mailOptions.subject = "Please verify this team"
      nodeMailer.mailOptions.html = "This is the team: " + req.body.leagueName + " in " + req.body.city + ", " + req.body.state + ", JWT: " + youthDraftToken
      return nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
		}).catch(error => {
			if (error["code"] == "ER_DUP_ENTRY")
				return res.status(400).json({ message: "Email already associated with this league." });
			return res.status(400).json({ message: "Please contact an admin." });
		});
	}
}
