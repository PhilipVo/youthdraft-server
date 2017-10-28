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

require('./server/config/routes.js')(app);

const server = app.listen(port, function () {
	console.log(`server running on port ${port}`);
});
