const 	users 			= require('../controllers/league.js');



module.exports = function (app) {

	// League routes
	app.post('/users/register', users.register);
	app.post('/users/login', users.login);
	// For bulk
	app.post('/api/upload-coaches', users.uploadCoaches);
	app.post('/api/upload-players', users.uploadPlayers);
	// For single
	app.get('/api/coaches', users.getCoaches);
	app.get('/api/players', users.getPlayers);

	// app.get('/api/users', users.show);
	// // app.put('/api/users/password', users.password);
	// app.put('/api/api/users', users.update);
	// // app.delete('/users', users.delete);
	// app.post('/api/users/logout', users.logout);
	// app.put('/api/users/update-device-token', users.updateDeviceToken);

}
