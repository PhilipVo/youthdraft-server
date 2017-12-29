const 	league 					= require('../controllers/league.js'),
				leagueRegister 	= require('../controllers/league-registration.js'),
				coaches 				= require('../controllers/coaches.js'),
				players 				= require('../controllers/players.js'),
				tryouts				 	= require('../controllers/tryouts.js'),
				teams					 	= require('../controllers/teams.js'),
				formulas			 	= require('../controllers/formulas.js'),
				stats					 	= require('../controllers/stats.js'),
				divisions				= require('../controllers/divisions.js'),
				upload					= require('./multer.js'),
				uploadOld				= require('../controllers/uploadOldData.js'),
				contactUs				= require('../controllers/contact-us.js'),
				uploadFields		= [{ name: 'teams', maxCount: 1 }, { name: 'coaches', maxCount: 1 }, { name: 'players', maxCount: 1 }];

module.exports = function (app) {

	////////////////////////////////////////////////////////////
	//                  League Admin routes                   //
	////////////////////////////////////////////////////////////

	app.post('/league/register', upload.fields(uploadFields), leagueRegister.register);
	app.get('/leagues', league.getAll); // to get all the leagues for selecting from the drop down, contains, league name, city, state, and league id
	app.post('/api/league/validate', league.validate); // for youthdraft to verify a league
	app.post('/api/league/reject', league.reject); // for youthdraft to unverify and delete a league
	app.post('/league/login', league.login); // returns JWT for the league admin
	app.post('/league/reset', league.reset); // reset the password for the league admin
	app.get('/api/league', league.get); // to get all the info connected to the league account
	app.put('/api/league', league.update); // update the league admin profile
	app.put('/api/league/password', league.password); // update the league admin password

	// app.post('/api/uploadOld', uploadOld.createTest);

	////////////////////////////////////////////////////////////
	//                     Tryout routes                      //
	////////////////////////////////////////////////////////////

	app.get('/api/tryouts', tryouts.getAll); //get all try outs for the league
	app.post('/api/tryouts', tryouts.modify);

	////////////////////////////////////////////////////////////
	//                       Team routes                      //
	////////////////////////////////////////////////////////////

	app.post('/api/teams/:id', teams.teams);
	app.post('/api/teams', teams.teams);
	app.get('/api/teams', teams.getAll);
	app.delete('/api/teams/:id', teams.delete);

	////////////////////////////////////////////////////////////
	//                     Coaches routes                     //
	////////////////////////////////////////////////////////////

	app.post('/coaches/register', coaches.register);
	app.get('/api/coaches/all', coaches.getAll);
	app.post('/api/coaches/validate/:id', coaches.validate);
	app.post('/coaches/reset', coaches.reset);
	app.post('/coaches/login', coaches.login);
	app.put('/api/coaches/:id', coaches.coaches);
	app.post('/api/coaches', coaches.createCoaches);
	app.post('/api/coaches/password', coaches.password);
	app.get('/api/coaches', coaches.get);
	app.delete('/api/coaches/:id', coaches.delete);

	////////////////////////////////////////////////////////////
	//                     Players routes                     //
	////////////////////////////////////////////////////////////

	app.put('/api/players/:id', players.players);
	app.post('/api/players', players.players);
	app.get('/api/players', players.getAll);
	app.get('/api/players/get-players-for-division/:division', players.getDivision);
	app.delete('/api/players/:id', players.delete);

	////////////////////////////////////////////////////////////
	//                     Formulas routes                    //
	////////////////////////////////////////////////////////////

	app.put('/api/formulas/:id', formulas.formulas);
	app.post('/api/formulas', formulas.formulas);
	app.get('/api/formulas', formulas.getAll);
	app.delete('/api/formulas/:id', formulas.delete);


	////////////////////////////////////////////////////////////
	//                      Stats routes                      //
	////////////////////////////////////////////////////////////

	app.put('/api/stats/:id', stats.stats);
	app.post('/api/stats', stats.stats);
	app.get('/api/stats', stats.getAll);
	app.get('/api/stats/:playerId', stats.get);
	app.delete('/api/stats/:id', stats.delete);

	////////////////////////////////////////////////////////////
	//                    Divisions Routes                    //
	////////////////////////////////////////////////////////////

	app.get('/divisions', divisions.getAll)

	////////////////////////////////////////////////////////////
	//                   Contact Us Routes                    //
	////////////////////////////////////////////////////////////

	app.post('/contact/send', contactUs.sendMessage)

}
