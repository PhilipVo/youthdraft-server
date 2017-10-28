const 	users 			= require('../controllers/league.js');



module.exports = function (app) {

	// League routes
	app.post('/users/register', users.register);
	app.post('/users/login', users.login);
	app.post('/upload-coaches', users.uploadCoaches);
	app.post('/upload-players', users.uploadPlayers);

	// app.get('/api/users', users.show);
	// // app.put('/api/users/password', users.password);
	// app.put('/api/api/users', users.update);
	// // app.delete('/users', users.delete);
	// app.post('/api/users/logout', users.logout);
	// app.put('/api/users/update-device-token', users.updateDeviceToken);

}
