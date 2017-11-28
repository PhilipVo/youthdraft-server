const nodemailer = require('nodemailer');
const key = require('../../keys/keys');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: key.auth
});

const mailOptions = {
  from: '"Youth Draft" <mootest21@gmail.com>', // sender address
  to: '', // list of receivers
  subject: '', // Subject line
  html: ''// plain text body
};

const leagueEmail = data => {
  return new Promise((resolve, reject) => {
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

const rejectLeague = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:2em;display:block">We are sorry to inform you that your league account for %%leagueName%%
      at %%leagueCity%%, %%leagueState%% at Youthdraft.com has been rejected/terminated.  You can contact the Youthdraft
      Team at <a href='mailto:` + key.youthdraftEmail + `'>` + key.youthdraftEmail + `</a> if you have any concerns.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

const verifyLeagueEmail = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:0.5em;display:block">Congratulations! Your league, %%leagueName%% at %%leagueCity%%,
      %%leagueState%%, has been validated. You can now sign into either your Youthdraft mobile app or at <a href='http://Youthdraft.com'>
      Youthdraft.com</a> using your email and the following password:</span>
    <span style="padding-bottom:0.5em;display:block">%%password%%</span>
    <span style="padding-bottom:2em;display:block">Once inside your account, please remember to change your password to
      something more memorable.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

const resetLeaguePassword = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:0.5em;display:block">Your password has been reset. Here is your new password:</span>
    <span style="padding-bottom:0.5em;display:block">%%password%%</span>
    <span style="padding-bottom:2em;display:block">Once inside your account, please remember to change your password to
      something more memorable.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

const rejectCoachEmail = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:2em;display:block">We are sorry to inform you that your coaching account at Youthdraft.com
      has been rejected/terminated for %%leagueName%% at %%leagueCity%%, %%leagueState%%.  You can contact your league for
      more information at %%leagueEmail%%.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

const verifyCoachEmail = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:0.5em;display:block">Congratulations! You have been accepted to coach for %%leagueName%% at
      %%leagueCity%%, %%leagueState%%.  You can now sign into either your Youthdraft mobile app or at <a href='http://Youthdraft.com'>
      Youthdraft.com</a> using your email and the following password:</span>
    <span style="padding-bottom:0.5em;display:block">%%password%%</span>
    <span style="padding-bottom:2em;display:block">Once inside your account, please remember to change your password to
      something more memorable.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

const resetCoachPassword = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:0.5em;display:block">Your password has been reset. Here is your new password:</span>
    <span style="padding-bottom:0.5em;display:block">%%password%%</span>
    <span style="padding-bottom:2em;display:block">Once inside your account, please remember to change your password to
      something more memorable.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

const createCoachEmail = data => {
  return new Promise((resolve, reject) => {
    let replaced = ""
    const html = `<p><span style="padding-bottom:2em;display:block">Hello %%firstName%% %%lastName%%,</span>
    <span style="padding-bottom:0.5em;display:block">Congratulations! Your account at Youthdraft.com was created
      by %%leagueFirstName%% %%leagueLastName%% for %%leagueName%% at %%leagueCity%%, %%leagueState%%.  You can
      now sign into either your Youthdraft mobile app or at <a href='http://Youthdraft.com'>Youthdraft.com</a>
      using your email and the following password:</span>
    <span style="padding-bottom:0.5em;display:block">%%password%%</span>
    <span style="padding-bottom:2em;display:block">Once inside your account, please remember to change your password to
      something more memorable.</span>
    <span style="display:block">Sincerely,</span>
    <span style="display:block">The Youthdraft Team</span>`;
    const parts = html.split(/(\%\%\w+?\%\%)/g).map(function(v) {
      replaced = v.replace(/\%\%/g,"");
      return data[replaced] || replaced;
    });
    resolve(parts.join(""))
  })
};

module.exports =  {
  transporter,
  mailOptions,
  verifyLeagueEmail,
  rejectCoachEmail,
  verifyCoachEmail,
  resetCoachPassword
}
