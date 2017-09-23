const   bp              = require('body-parser'),
        express         = require('express'),
        expressJWT      = require('express-jwt'),
        helmet          = require('helmet'),
        jwtKey          = require('./keys/keys').jwtKey,
        path            = require('path'),

        app             = express(),
        port            = process.env.PORT || 5000;

app.use(helmet());
app.use(bp.json());
app.use('/api', expressJWT({ secret: jwtKey }));

// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
//     next();
// });

require('./server/config/routes.js')(app);

const server = app.listen(port, function () {
	console.log(`server running on port ${port}`);
});
