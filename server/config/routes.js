const 	users 			= require('../controllers/league.js');



module.exports = function (app) {
	app.get('/api/users', users.show);
	app.post('/users/register', users.register);
	// app.put('/api/users/password', users.password);
	app.put('/api/api/users', users.update);
	// app.delete('/users', users.delete);
	app.post('/users/login', users.login);
	app.post('/api/users/logout', users.logout);
	app.put('/api/users/update-device-token', users.updateDeviceToken);

}
