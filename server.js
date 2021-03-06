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
    // Allowing multiple websites to connect
    var allowedOrigins = ['http://localhost:4200', 'https://youthdraft.com', 'https://www.youthdraft.com'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
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
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api', expressJWT({ secret: jwtKey }));

const routes = require('./server/config/routes.js')(app);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/index.html'));
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.json({ message: err.message});
  next(err)
})
