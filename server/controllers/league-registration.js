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
    const divisionHash = {}, passwordArray = [], files = [req.files.players[0].path, req.files.coaches[0].path, req.files.teams[0].path];
    let divisionString = "";

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
    if (req.body.tryouts) {
      req.body.tryouts = JSON.parse(req.body.tryouts)
      if (req.body.tryouts.length > 5) {
        files.forEach(filepath => {fs.unlink(filepath, err => {})});
        return res.status(400).json({ message: "Only up to 5 tryout dates are allowed.", tryouts: req.body.tryouts});
      }

      for (var i = 0; i < req.body.tryouts.length; i++) {
        if (!req.body.tryouts[i].date || !req.body.tryouts[i].address) {
          files.forEach(filepath => {fs.unlink(filepath, err => {})});
          return res.status(400).json({ message: "Tryouts need both a date and an address.", tryouts: req.body.tryouts });
        }
        if (!/^\(?([0-9]{4})\)?[- ]?(0?[1-9]|1[0-2])[- ]?(0?[1-9]|[12]\d|30|31)[ T](0?[1-9]|1[0-9]|2[0-4]):(0?[1-9]|[1-6]\d)?Z?$/.test(req.body.tryouts[i].date)) {
          files.forEach(filepath => {fs.unlink(filepath, err => {})});
          return res.status(400).json({ message: "Tryout times should be in the format of YYYY-MM-DD HH:MM."});
        }
        tempTryouts[i] = [req.body.tryouts[i].date.substring(4,6), req.body.tryouts[i].address];
        tempTryouts[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        tempTryouts[i].push(new Buffer(id, "hex"));
        tempTryouts[i].push("NOW()");
        tempTryouts[i].push("NOW()");
      }
    }
    req.body.tryouts = tempTryouts;

    if (!req.files.players || !req.files.coaches || !req.files.teams) {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(400).json({message: "Please try uploading your .csv or .xlsx file for players again"})
    }

    Promise.using(getConnection(), connection => connection.query("SELECT * FROM divisions"))
    .spread(data => {
      for (let i = 0; i < data.length; i++) {
        if (i == data.length - 1) {
          divisionString += ", and "
        } else if (i != 0) {
          divisionString += ", "
        }
        divisionHash[data[i].type] = 1
        divisionString += data[i].type
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

        if (!jsonArray[i][0] || jsonArray[i][0] == "")
          throw { status: 400, message: "Team name should be filled out. Please check cell A" + (i + 1)};
        if (!divisionHash[jsonArray[i][1]])
          throw { status: 400, message: "Teams should be assigned one of the following divisions: " + divisionString + ". Please check cell B" + (i + 1)};

        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.teams = jsonArray.slice(1)
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

        if (!/^\(?([0-9]{4})\)?[-/.]?(0?[1-9]|1[0-2])[-/.]?(0?[1-9]|[12]\d|30|31)$/.test(jsonArray[i][2]))
          throw { status: 400, message: "Player's DOB should be in the format of YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD. Please check cell C" + (i + 1)};
        if (!/^([0-9]|[1-9][0-9]|100)$/.test(jsonArray[i][4]))
          throw { status: 400, message: "Player's league age should be less than 100. Please check cell E" + (i + 1)};
        if (!divisionHash[jsonArray[i][5]])
          throw { status: 400, message: "Players should be assigned one of the following divisions: " + divisionString + ". Please check cell F" + (i + 1)};
        if (!/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/.test(jsonArray[i][8]))
          throw { status: 400, message: "Invalid player's phone number. Phone number format should be: XXX-XXX-XXXX. Please check cell I" + (i + 1)};
    		if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(jsonArray[i][9]))
          throw { status: 400, message: "Invalid player's email. Email format should be: email@mailserver.com. Please check cell J" + (i + 1)};

        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
      }
      req.body.players = jsonArray.slice(1)
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

        if (!/^\(?([0-9]{4})\)?[-/.]?(0?[1-9]|1[0-2])[-/.]?(0?[1-9]|[12]\d|30|31)$/.test(jsonArray[i][2]))
          throw { status: 400, message: "Coach's DOB should be in the format of YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD. Please check cell C" + (i + 1)};
        if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(jsonArray[i][4]))
          throw { status: 400, message: "Coach's email is invalid. Email format should be: email@mailserver.com. Please check cell E" + (i + 1)};
        if (!/^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/.test(jsonArray[i][5]))
          throw { status: 400, message: "Coach's phone number is invalid. Phone number format should be: XXX-XXX-XXXX. Please check cell F" + (i + 1)};
        if (!/^[0-9]{5}(?:[-\s][0-9]{4})?$/.test(jsonArray[i][9]))
          throw { status: 400, message: "Coach's zip code is invalid. Zip code format should be: XXXXX or XXXXX-XXXX or XXXXX XXXX. Please check cell J" + (i + 1)};
        if (!divisionHash[jsonArray[i][10]])
          throw { status: 400, message: "Coaches should be assigned one of the following divisions: " + divisionString + ". Please check cell K" + (i + 1)};
        if (jsonArray[i][11].toLowerCase().includes("assistant")) {
          jsonArray[i][11] = "Assistant"
        } else if (jsonArray[i][11].toLowerCase().includes("head")) {
          jsonArray[i][11] = "Head"
        } else {
          throw { status: 400, message: "Coaches should either be a head coach or an assistant coach.  Please check cell L" + (i + 1)};
        }

        passwordArray.push(generator.generate({ length: 10, strict: true, numbers: true  }));
        jsonArray[i].push("UNHEX(REPLACE(UUID(), '-', ''))");
        jsonArray[i].push(new Buffer(id, "hex"));
        jsonArray[i].push("NOW()");
        jsonArray[i].push("NOW()");
        jsonArray[i].push(1);
      }
      req.body.coaches = jsonArray.slice(1)

      req.body.numCoaches = req.body.coaches.length - 1
      req.body.numPlayers = req.body.teams.length - 1
      req.body.numTeams = req.body.players.length - 1
      console.log("works1");


			const data2 = [id, req.body.email, req.body.firstName, req.body.lastName, req.body.leagueName, req.body.phoneNumber, req.body.city, req.body.state];
			const query2 = "INSERT INTO leagues SET id = UNHEX(?), email = ?, firstName = ?, lastName = ?, isLive = 0, " +
				"leagueName = ?, phoneNumber = ?, city = ?, state = ?, createdAt = NOW(), updatedAt = NOW()";
			return Promise.using(getConnection(), connection => connection.execute(query2, data2));
    }).then(() => Promise.map(passwordArray, function(password) {
      return bcrypt.hashAsync(password, 10)
    })).then(hashes => {
      for (let i = 0; i < hashes.length; i++) {
        req.body.coaches[i].push(hashes[i])
      }
      if (req.body.coaches.length > 0) {
        const query = "INSERT INTO coaches (firstName, lastName, birthday, gender, email, phoneNumber, address, " +
          "city, state, zip, division, coachType, id, leagueId, createdAt, updatedAt, validated, password) VALUES ?"
        return Promise.using(getConnection(), connection => connection.query(query, [req.body.coaches]));
      }
      else return Promise.resolve();
    }).then(() => {
      if (req.body.teams.length > 0) {
        jsonArray = req.body.teams
        const query = "INSERT INTO teams (name, division, id, leagueId, createdAt, updatedAt) VALUES ?";
        return Promise.using(getConnection(), connection => connection.query(query, [jsonArray]));
      }
      else return Promise.resolve();
    }).then(() => {
      if (req.body.players.length > 0) {
        const query = "INSERT INTO players (firstName, lastName, birthday, gender, leagueAge, division, " +
          "parentFirstName, parentLastName, phoneNumber, email, id, leagueId, createdAt, updatedAt) VALUES ?";
          console.log(query);
          console.log(req.body.players);
        return Promise.using(getConnection(), connection => connection.query(query, [req.body.players]));
      }
      else return Promise.resolve();
    }).spread(data => {
      if (tempTryouts.length > 0) {
        console.log(tempTryouts);
        const query = "INSERT INTO tryouts (date, address, id, leagueId, createdAt, updatedAt) VALUES ?"
        console.log(query);
        console.log(tempTryouts);
        return Promise.using(getConnection(), connection => connection.query(query, [tempTryouts]));
      }
      return Promise.resolve();
    }).then(() => {
      if (passwordArray.length > 0) {
        const coachArray = []
        for (let i = 0; i < passwordArray.length; i++) {
          const tempData = {}
          tempData.firstName = req.body.coaches[i][0],
          tempData.lastName = req.body.coaches[i][1],
          tempData.email = req.body.coaches[i][4],
          tempData.leagueFirstName = req.body.firstName,
          tempData.leagueLastName = req.body.lastName,
          tempData.leagueCity = req.body.city,
          tempData.leagueState = req.body.state,
          tempData.leagueName = req.body.leagueName,
          tempData.password = passwordArray[i]
          coachArray.push(tempData)
        }

        return Promise.map(coachArray, coach => nodeMailer.createCoachEmail(coach))
        .map(data => nodeMailer.transporter.sendMail(data))
      }
      else return Promise.resolve();
    }).then((data) => {
      console.log(data);
      req.body.JWT = jwt.sign({
				id: id,
        youthdraftKey: serverKeys.youthdraftKey,
				iat: Math.floor(Date.now() / 1000) - 30
			}, jwtKey);
      return nodeMailer.leagueEmail(req.body)
    }).then(email => {
      nodeMailer.mailOptions.attachments = [{path: req.files.coaches[0].path}, {path: req.files.players[0].path}, {path: req.files.teams[0].path}]
      nodeMailer.mailOptions.to = serverKeys.youthdraftEmail
      nodeMailer.mailOptions.subject = "Please verify this league"
      nodeMailer.mailOptions.html = email
      return nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
    }).then(() => {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      return res.status(200).json(req.body);
    }).catch(error => {
      files.forEach(filepath => {fs.unlink(filepath, err => {})});
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      if (error["code"] == "ER_DUP_ENTRY")
				return res.status(400).json({ message: "Email already associated with this league." });
      return res.status(400).json({message: "Please contact an admin.", error: error});
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
