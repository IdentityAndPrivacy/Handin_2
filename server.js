// server.js

// BASE SETUP
// =============================================================================

// Setup the packages that we need
var express    = require('express'), 
	exphbs     = require('express-handlebars');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var url = require('url') ;

// Setup view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';
var token = 'ii9hD7yw8ao9ereDh34aer93db';
var experation = new Date();
experation.setHours(experation.getHours()+1);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/login', function(req, res) {
	var receivedClientId = url.parse(req.url,true).query.clientId;
	console.log('RClientId: ' + receivedClientId);
    res.render('login');   
});

router.post('/authorize', function(req, res) {
	console.log(req.body.username);
	console.log(req.body.password);
	// if (req.body.clientId === clientId) {
	// 	res.json({ message: 'Authenticated', token: token, expires: experation});  
	// }
	// else {
	// 	res.json({ message: 'Go away!' }); 
	// }	
})


router.post('/token-validation', function(req, res) {
	if(req.body.token === token)
	{
		res.json({ message: 'token is valid'});
	}
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);