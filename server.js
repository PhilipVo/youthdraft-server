const   bp              = require('body-parser'),
        express         = require('express'),
        expressJWT      = require('express-jwt'),
        helmet          = require('helmet'),
        jwtKey          = require('./keys/keys').jwtKey,
        path            = require('path'),
        app             = express(),
        port            = process.env.PORT || 5000;

const server = app.listen(port, function () {
	console.log(`server running on port ${port}`);
});

const socket = require('./server/services/socket.js')(server);

// CORS
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://172.31.99.97:4200');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, authorization');
    next();
});
app.use(function(req,res,next){
    req.io = socket;
    next();
});
app.use(helmet());
app.use(bp.json());
app.use('/api', expressJWT({ secret: jwtKey }));

const routes = require('./server/config/routes.js')(app);
