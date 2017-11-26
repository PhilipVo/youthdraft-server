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

const leagueEmail = data => {
  console.log("works1");
  return new Promise((resolve, reject) => {
    console.log("works2");
    let replaced = ""
    const html = `<p>Hello Chris,</br></br>
    Could you validate this league:</br></br>
    <span style="padding-left:2em"></span>League's Name: %%leagueName%%</br>
    <span style="padding-left:2em"></span>League Admin's Name: %%firstName%% %%lastName%%</br>
    <span style="padding-left:2em"></span>League Admin's Email: <a href="#">%%email%%</a></br>
    <span style="padding-left:2em"></span>League Admin's Phone Number: %%phoneNumber%%</br>
    <span style="padding-left:2em"></span>City: %%city%%</br>
    <span style="padding-left:2em"></span>State: %%state%%</br>
    <span style="padding-left:2em"></span>Number of Coaches: %%numCoaches%%</br>
    <span style="padding-left:2em"></span>Number of Players: %%numPlayers%%</br></br>
    <span style="padding-left:2em"></span><a href="https://youthdraft.com/league/validate/%%JWT%%">Accept</a>
    <span style="padding-left:4em"></span><a href="https://youthdraft.com/league/reject/%%JWT%%">Reject</a></p>`
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

module.exports =  {transporter, mailOptions, leagueEmail}
