// server.js

// BASE SETUP
// =============================================================================

// Setup the packages that we need
var express    	= require('express'), 
	exphbs     	= require('express-handlebars');        // call express
var app        	= express();                 // define our app using express
var bodyParser 	= require('body-parser');
var url 	   	= require('url') ;
var mongoose  	= require('mongoose');
var passwordHash = require('password-hash');

// MongoDB
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/HelloMongoose';

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name:{
  		firstname: String,
  		lastname: String
  }
});

var PUser = mongoose.model('Users', userSchema);

PUser.remove({}, function(err) {
  if (err) {
    console.log ('error deleting old data.');
  }
});

var martin = new PUser ({
  username: 'martin',
  password: passwordHash.generate('123'),
  name:{
  	firstname: 'Martin',
  	lastname: 'Jensen'
  }
});


var nikolas = new PUser ({
  username: 'nikolas',
  password: passwordHash.generate('111'),
  name:{
  	firstname: 'Nikolas',
  	lastname: 'Bram'
  }
});


var kasper = new PUser ({
  username: 'kasper',
  password: passwordHash.generate('112'),
  name:{
  	firstname: 'Kasper',
  	lastname: 'Nissen'
  }
});


// Saving it to the database.  
martin.save(function (err) {if (err) console.log ('Error on save!')});
nikolas.save(function (err) {if (err) console.log ('Error on save!')});
kasper.save(function (err) {if (err) console.log ('Error on save!')});

// Setup view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';
var authCode = 'k5dfD09asYyt9ak8d23as';
var redirectUrl = '';
var token = 'ii9hD7yw8ao9ereDh34aer93db';
var username = 'username';
var password = 'password';
var experation = new Date();
experation.setHours(experation.getHours()+1);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/images', express.static(__dirname + "/images"));

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/login', function(req, res) {
	var rClientId = url.parse(req.url,true).query.clientId;
	redirectUrl = url.parse(req.url,true).query.redirectUrl;

	if(rClientId === clientId) {
		res.render('login'); 
	}
	else {
		res.status(421);
		res.end();
	}    
});

router.post('/authorize', function(req, res) {

	var fUsername = req.body.username;
	var fPassword = req.body.password;

	var query = PUser.findOne({'username': fUsername});
	query.exec(function(err, user) {
    if (!err) {
      if(passwordHash.verify(fPassword, user.password))
      	{
      		var url = redirectUrl + '?authCode=' + authCode;
			res.status(200);
			res.json({redirectUrl: url});
			res.end();
      	}
      	else{
      		res.status(401);
      		res.json({message: 'Wrong password'})
      		res.end();
      	}
    } else {
    	res.status(401);
      	res.json({message: 'Wrong username'})
      	res.end();
    }
  });
});

router.get('/request-token', function(req, res){
	var rAuthCode = url.parse(req.url,true).query.authCode;
	if(rAuthCode === authCode){
		res.json({token: token, expires: experation});
	}
	else {
		res.status(421);
		res.json({error: 'AuthCode incorrect'});
		res.end();
	}
});


router.get('/token-validation', function(req, res) {
	var rToken = url.parse(req.url,true).query.token;
	if(rToken === token)
	{
		res.status(200);
		res.end();
	}
	else{
		res.status(421);
		res.end();
	}
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);