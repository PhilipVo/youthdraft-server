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
    const html = `<p><span style="padding-bottom:2em;display:block">Hello Chris,</span>
    <span style="padding-bottom:2em;display:block">Please validate this league:</span>
    <span style="padding-left:2em;display:block">League's Name: %%leagueName%%</span>
    <span style="padding-left:2em;display:block">League Admin's Name: %%firstName%% %%lastName%%</span>
    <span style="padding-left:2em;display:block">League Admin's Email: <a href="#">%%email%%</a></span>
    <span style="padding-left:2em;display:block">League Admin's Phone Number: %%phoneNumber%%</span>
    <span style="padding-left:2em;display:block">City: %%city%%</span>
    <span style="padding-left:2em;display:block">State: %%state%%</span>
    <span style="padding-left:2em;display:block">Number of Teams: %%numTeams%%</span>
    <span style="padding-left:2em;display:block">Number of Coaches: %%numCoaches%%</span>
    <span style="padding-left:2em;padding-bottom:2em;display:block">Number of Players: %%numPlayers%%</span>
    <span style="padding-left:2em"></span><a href='https://youthdraft.com/league/validate/%%JWT%%'>Accept</a>
    <span style="padding-left:4em"></span><a href='https://youthdraft.com/league/reject/%%JWT%%'>Reject</a></p>`
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

module.exports =  {transporter, mailOptions, leagueEmail}
