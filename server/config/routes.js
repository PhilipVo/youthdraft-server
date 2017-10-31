const 	league 					= require('../controllers/league.js'),
				coaches 				= require('../controllers/coaches.js'),
				players 				= require('../controllers/players.js'),
				tryouts				 	= require('../controllers/tryouts.js'),
				teams					 	= require('../controllers/teams.js');




module.exports = function (app) {

	////////////////////////////////////////////////////////////
	//                     League routes                      //
	////////////////////////////////////////////////////////////

	app.post('/leagues/register', league.register);
	app.post('/leagues/login', league.login);
	app.post('/api/leagues/create', league.create);
	app.get('/api/leagues', league.get);
	app.get('/leagues', league.getAll);
	app.put('/api/leagues', league.update);
	app.put('/api/leagues/password', league.password);

	////////////////////////////////////////////////////////////
	//                     Tryout routes                      //
	////////////////////////////////////////////////////////////

	app.get('/api/tryouts', tryouts.getAll);
	app.post('/api/tryouts', tryouts.modify);

	////////////////////////////////////////////////////////////
	//                       Team routes                      //
	////////////////////////////////////////////////////////////

	// For bulk
	app.post('/api/teams/upload', teams.upload);
	// For single
	app.post('/api/teams/:id', teams.teams);
	app.post('/api/teams', teams.teams);
	app.get('/api/teams', teams.getAll);
	app.delete('/api/teams/:id', teams.delete);

	////////////////////////////////////////////////////////////
	//                     Coaches routes                     //
	////////////////////////////////////////////////////////////

	// For bulk
	app.post('/api/coaches/upload', coaches.upload);
	// For single
	app.put('/api/coaches/:id', coaches.coaches);
	app.put('/api/coaches/:league/:id', coaches.coaches);
	app.post('/api/coaches', coaches.coaches);
	app.post('/api/coaches/register', coaches.register);
	app.post('/api/coaches/password', coaches.password);
	app.get('/api/coaches/all', coaches.getAll);
	app.get('/api/coaches', coaches.get);
	app.delete('/api/coaches/:id', coaches.delete);
	app.post('/api/coaches/validate', coaches.validate);

	////////////////////////////////////////////////////////////
	//                     Players routes                     //
	////////////////////////////////////////////////////////////

	// For bulk
	app.post('/api/players/upload', players.upload);
	// For single
	app.post('/api/players/:id', players.players);
	app.post('/api/players', players.players);
	app.get('/api/players', players.getAll);
	app.get('/api/players/get-players-for-division/:division', players.getDivision);
	app.delete('/api/players/:id', players.delete);

	////////////////////////////////////////////////////////////
	//                     Formulas routes                    //
	////////////////////////////////////////////////////////////

	app.post('/api/formulas/:id', formulas.formulas);
	app.post('/api/formulas', formulas.formulas);
	app.get('/api/formulas', formulas.getAll);
	app.delete('/api/formulas/:id', formulas.delete);


	////////////////////////////////////////////////////////////
	//                      Stats routes                      //
	////////////////////////////////////////////////////////////

	app.post('/api/stats/:id', stats.stats);
	app.post('/api/stats', stats.stats);
	app.get('/api/stats', stats.getAll);
	app.get('/api/stats/:playerId', stats.get);
	app.delete('/api/stats/:id', stats.delete);

}
