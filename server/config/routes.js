const 	league 					= require('../controllers/league.js'),
				leagueCoaches 	= require('../controllers/leagueCoaches.js'),
				leaguePlayers 	= require('../controllers/leaguePlayers.js'),
				tryouts				 	= require('../controllers/tryouts.js'),
				teams					 	= require('../controllers/teams.js');




module.exports = function (app) {

	////////////////////////////////////////////////////////////
	//											League routes  										//
	////////////////////////////////////////////////////////////

	app.post('/league/register', league.register);
	app.post('/league/login', league.login);
	app.post('/api/league/create', league.createLeague);
	app.get('/api/league/account', league.getAccount);
	app.put('/api/league/account', league.getAccount);
	app.put('/api/league/account/password', league.getAccount);

	////////////////////////////////////////////////////////////
	//											Tryout routes  										//
	////////////////////////////////////////////////////////////

	app.get('/api/league/tryouts', tryouts.modifyTryouts);
	app.post('/api/league/tryouts', tryouts.getTryouts);

	////////////////////////////////////////////////////////////
	//										 	 Team routes  				 						//
	////////////////////////////////////////////////////////////

	// For bulk
	app.post('/api/league/upload-teams', teams.uploadTeams);
	// For single
	app.post('/api/league/teams/:id', teams.teams);
	app.post('/api/league/teams', teams.teams);
	app.get('/api/league/teams', teams.getTeams);
	app.delete('/api/league/teams/:id', teams.deleteTeams);

	////////////////////////////////////////////////////////////
	//									League Coaches routes  								//
	////////////////////////////////////////////////////////////

	// For bulk
	app.post('/api/league/upload-coaches', leagueCoaches.uploadCoaches);
	// For single
	app.post('/api/league/coaches/:id', leagueCoaches.coaches);
	app.post('/api/league/coaches', leagueCoaches.coaches);
	app.get('/api/league/coaches', leagueCoaches.getCoaches);
	app.delete('/api/league/coaches/:id', leagueCoaches.deleteCoaches);
	app.post('/api/league/validate', leagueCoaches.validateCoaches);

	////////////////////////////////////////////////////////////
	//									League Players routes  								//
	////////////////////////////////////////////////////////////

	// For bulk
	app.post('/api/league/upload-players', leaguePlayers.uploadPlayers);
	// For single
	app.post('/api/league/players/:id', leaguePlayers.players);
	app.post('/api/league/players', leaguePlayers.players);
	app.get('/api/league/players', leaguePlayers.getPlayers);
	app.delete('/api/league/players/:id', leaguePlayers.deletePlayers);

}
