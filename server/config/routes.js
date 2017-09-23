var users = require('../controllers/users.js');

module.exports = function (app) {

	app.get('/api/users', users.show);
	app.post('/api2/users/register', users.register);
	// app.put('/users/password', users.password);
	app.put('/api/users', users.update);
	// app.delete('/users', users.delete);
	app.post('/api2/users/login', users.login);
	app.post('/api/users/logout', users.logout);
	app.put('/api/users/update-device-token', users.updateDeviceToken);

}
