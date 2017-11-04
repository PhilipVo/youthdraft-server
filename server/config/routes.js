const 	league 					= require('../controllers/league.js'),
				coaches 				= require('../controllers/coaches.js'),
				players 				= require('../controllers/players.js'),
				tryouts				 	= require('../controllers/tryouts.js'),
				teams					 	= require('../controllers/teams.js'),
				formulas			 	= require('../controllers/formulas.js'),
				stats					 	= require('../controllers/stats.js');




module.exports = function (app) {

	////////////////////////////////////////////////////////////
	//                  League Admin routes                   //
	////////////////////////////////////////////////////////////

	app.post('/league/register', league.register); // returns JWT for the league admin
	app.get('/leagues', league.getAll); // to get all the leagues for selecting from the drop down, contains, league name, city, state, and league id
	app.post('/league/login', league.login); // returns JWT for the league admin
	app.post('/api/league/create', league.create); // tells the server that the league has been finished creating and is now being used
	app.get('/api/league', league.get); // to get all the info connected to the league account
	app.put('/api/league', league.update); // update the league admin profile
	app.put('/api/league/password', league.password); // update the league admin password

	////////////////////////////////////////////////////////////
	//                     Tryout routes                      //
	////////////////////////////////////////////////////////////

	app.get('/api/tryouts', tryouts.getAll); //get all try outs for the league
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
	app.post('/api/coaches/register', coaches.register);
	app.get('/api/coaches/all', coaches.getAll);
	app.post('/api/coaches/validate', coaches.validate);
	app.post('/api/coaches/register', coaches.login);
	app.put('/api/coaches/:id', coaches.coaches);
	app.post('/api/coaches', coaches.coaches);
	app.post('/api/coaches/password', coaches.password);
	app.get('/api/coaches', coaches.get);
	app.delete('/api/coaches/:id', coaches.delete);

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
