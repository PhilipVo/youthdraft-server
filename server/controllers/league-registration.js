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

module.exports = {
  tester: (req, res) => {

    const divisionHash = {}, files = [req.files.players[0].path, req.files.coaches[0].path, req.files.teams[0].path];

    // Expecting all form data.
		if (
			!req.body.email ||
			!req.body.firstName ||
			!req.body.lastName ||
			!req.body.leagueName ||
			!req.body.phoneNumber ||
			!req.body.city ||
      !req.body.state
		) {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(400).json({ message: "All form fields are required." });
    }

    // Validate phone number as XXX-XXX-XXXX:
    if (!/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/.test(req.body.phoneNumber)) {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(400).json({ message: "Invalid phone number. Phone number format should be: XXX-XXX-XXXX." });
    }

		// Validate email:
		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.body.email)) {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(400).json({ message: "Invalid email. Email format should be: email@mailserver.com." });
    }

		const id = uuid().replace(/\-/g, "");

    let tempTryouts = []
    if (req.body.tryouts.length > 5) {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(400).json({ message: "Only up to 5 tryout dates are allowed."});
    }

    for (var i = 0; i < req.body.tryouts.length; i++) {
      if (!req.body.tryouts[i].date || !req.body.tryouts[i].address) {
        files.forEach(filepath => {fs.unlink(filepath, err => {})});
        return res.status(400).json({ message: "Tryouts need both a date and an address." });
      }
      tempTryouts[i] = [req.body.tryouts[i].date, req.body.tryouts[i].address];
      tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
      tempTryouts[i].push(new Buffer(id, "hex"));
      tempTryouts[i].push("NOW()");
      tempTryouts[i].push("NOW()");
    }
    req.body.tryouts = tempTryouts;

    if (!req.files.players || !req.files.coaches || !req.files.teams) {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(400).json({message: "Please try fsing your .csv or .xlsx file for players again"})
    }

    Promise.using(getConnection(), connection => connection.query("SELECT * FROM divisions"))
    .spread(data => {
      for (let i = 0; i < data.length; i++) {
        console.log(data[i].type);
      }
      return xlsxConverter("./" + req.files.teams[0].path)
    }).then(jsonArray => {
      const tempLength = jsonArray.length;
      if (tempLength > 0 && jsonArray[0].length < 2)
        throw { status: 400, message: "Please check your Teams spreadsheet, you are missing a column." };
      if (jsonArray[0][0] != "Team Name" || jsonArray[0][1] != "Division")
        throw { status: 400, message: "Please check your Teams spreadsheet, your columns do not match the example spreadsheet." };
      for (var i = 1; i < tempLength; i++) {
        if (jsonArray[i].length > 2)
          jsonArray[i].splice(2)
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.teams = jsonArray
      return Promise.resolve();
    }).then(() => xlsxConverter("./" + req.files.players[0].path))
    .then( jsonArray => {
      const tempLength = jsonArray.length;
      if (tempLength > 0 && jsonArray[0].length < 10)
        throw { status: 400, message: "Please check your Players spreadsheet, you are missing a column." };
      if (
        jsonArray[0][0] != "First Name" ||
        jsonArray[0][1] != "Last Name" ||
        jsonArray[0][2] != "DOB" ||
        jsonArray[0][3] != "Gender" ||
        jsonArray[0][4] != "League Age" ||
        jsonArray[0][5] != "Prior Division" ||
        jsonArray[0][6] != "Parent First Name" ||
        jsonArray[0][7] != "Parent Last Name" ||
        jsonArray[0][8] != "Parent Phone Number" ||
        jsonArray[0][9] != "Parent Email"
      )
        throw { status: 400, message: "Please check your Players spreadsheet, your columns do not match the example spreadsheet." };
      for (var i = 1; i < tempLength; i++) {
        if (jsonArray[i].length > 10)
          jsonArray[i].splice(10)
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.players = jsonArray
      return Promise.resolve();
    }).then(() => xlsxConverter("./" + req.files.coaches[0].path))
    .then( jsonArray => {
      const tempLength = jsonArray.length;
      if (tempLength > 0 && jsonArray[0].length < 12)
        throw { status: 400, message: "Please check your Coaches spreadsheet, you are missing a column." };
      if (
        jsonArray[0][0] != "First Name" ||
        jsonArray[0][1] != "Last Name" ||
        jsonArray[0][2] != "DOB" ||
        jsonArray[0][3] != "Gender" ||
        jsonArray[0][4] != "Email Address" ||
        jsonArray[0][5] != "Phone Number" ||
        jsonArray[0][6] != "Street Address" ||
        jsonArray[0][7] != "City" ||
        jsonArray[0][8] != "State" ||
        jsonArray[0][9] != "Zip" ||
        jsonArray[0][10] != "Division" ||
        jsonArray[0][11] != "Coach Type"
      )
        throw { status: 400, message: "Please check your Coaches spreadsheet, your columns do not match the example spreadsheet." };
      for (var i = 1; i < tempLength; i++) {
        if (jsonArray[i].length > 12)
          jsonArray[i].splice(12)
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        // jsonArray[i].push("UNHEX(" + req.user.id + ")");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.coaches = jsonArray

      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(200).json(req.body);
    }).catch(error => {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
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
