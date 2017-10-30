const 	league 					= require('../controllers/league.js'),
				leagueCoaches 	= require('../controllers/leagueCoaches.js'),
				leaguePlayers 	= require('../controllers/leaguePlayers.js'),
				tryouts				 	= require('../controllers/tryouts.js');




module.exports = function (app) {

	////////////////////////////////////////////////////////////
	//											League routes  										//
	////////////////////////////////////////////////////////////

	app.post('/league/register', league.register);
	app.post('/league/login', league.login);
	// For bulk
	app.post('/api/league/upload-coaches', leagueCoaches.uploadCoaches);
	app.post('/api/league/upload-players', leaguePlayers.uploadPlayers);
	// // For single
	app.post('/api/league/coaches/:id', leagueCoaches.coaches);
	app.post('/api/league/coaches', leagueCoaches.coaches);
	// app.post('/api/league/players/:type', leaguePlayers.players);
	app.get('/api/league/coaches', leagueCoaches.getCoaches);
	app.get('/api/league/players', leaguePlayers.getPlayers);


	// app.get('/api/users', users.show);
	// // app.put('/api/users/password', users.password);
	// app.put('/api/api/users', users.update);
	// // app.delete('/users', users.delete);
	// app.post('/api/users/logout', users.logout);
	// app.put('/api/users/update-device-token', users.updateDeviceToken);

}
