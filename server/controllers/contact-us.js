const Promise = require("bluebird");
const nodeMailer = require('../config/nodemailer');
const serverKeys = require("../../keys/keys");

module.exports = {
  sendMessage: (req, res) => {
    if (
      !req.body.email ||
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.message
    ) {
      return res.status(400).json({ message: "All form fields are required." })
    }

    nodeMailer.mailOptions.from = req.body.email
    nodeMailer.mailOptions.to = serverKeys.youthdraftEmail
    nodeMailer.mailOptions.subject = "Message from " + req.body.firstName + " " + req.body.lastName
    nodeMailer.mailOptions.html = req.body.message + `<span style="padding-top:2em;display:block">To reply: ` + req.body.email + "</span>"

    nodeMailer.transporter.sendMail(nodeMailer.mailOptions)
    .then(info => res.status(200).json())
    .catch(error => {
      return res.status(500).json({ message: "Please contact an admin."});
    });
	}
}
