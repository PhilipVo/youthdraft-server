const nodemailer = require('nodemailer');
const auth = require('../../keys/keys').auth;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: auth
});

const mailOptions = {
  from: '"Youth Draft" <mootest21@gmail.com>', // sender address
  to: '', // list of receivers
  subject: '', // Subject line
  html: ''// plain text body
};

module.exports =  {transporter, mailOptions}
