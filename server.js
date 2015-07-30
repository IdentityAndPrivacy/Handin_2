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
var crypto = require('crypto');

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
    token: String,
    authCode: String,
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
  token: '',
  authCode: '',
  name:{
  	firstname: 'Martin',
  	lastname: 'Jensen'
  }
});


var nikolas = new PUser ({
  username: 'nikolas',
  password: passwordHash.generate('111'),
  token: '',
  authCode: '',
  name:{
  	firstname: 'Nikolas',
  	lastname: 'Bram'
  }
});

var gert = new PUser ({
  username: 'gert',
  password: passwordHash.generate('password'),
  token: '',
  authCode: '',
  name:{
  	firstname: 'Gert',
  	lastname: 'Mikkelsen'
  }
});


var kasper = new PUser ({
  username: 'kasper',
  password: passwordHash.generate('112'),
  token: '',
  authCode: '',
  name:{
  	firstname: 'Kasper',
  	lastname: 'Nissen'
  }
});


// Saving it to the database.  
martin.save(function (err) {if (err) console.log ('Error on save!')});
nikolas.save(function (err) {if (err) console.log ('Error on save!')});
kasper.save(function (err) {if (err) console.log ('Error on save!')});
gert.save(function (err) {if (err) console.log ('Error on save!')});

// Setup view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';

var redirectUrl = '';

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

	var _res = res;

	var query = PUser.findOne({'username': fUsername});
	query.exec(function(err, user) {
		if (!err) {
			console.log(user);
		  if(passwordHash.verify(fPassword, user.password))
		  	{
		  		console.log('Verified');
		  		var current_date = (new Date()).valueOf().toString();
				var random = Math.random().toString();
				var gAuthCode = crypto.createHash('sha1').update(current_date + random).digest('hex');
				user.authCode = gAuthCode;
				user.save(function (err) {if (err) console.log ('Error on save!')});
				
				console.log('AuthCode: ' + gAuthCode);

		  		var url = redirectUrl + '?authCode=' + gAuthCode;
				_res.status(200);
				_res.json({redirectUrl: url});
				_res.end();
		  	}
		  	else{
		  		_res.status(401);
		  		_res.json({message: 'Wrong password'})
		  		_res.end();
		  	}
		} else {
			_res.status(401);
		  	_res.json({message: 'Wrong username'})
		  	_res.end();
		}
  });
});

router.get('/request-token', function(req, res){
	var rAuthCode = url.parse(req.url,true).query.authCode;

	var _res = res;

	var query = PUser.findOne({'authCode': rAuthCode});
	query.exec(function(err, user) {
		if (!err) {
			var current_date = (new Date()).valueOf().toString();
			var random = Math.random().toString();
			var gToken = crypto.createHash('sha1').update(current_date + random).digest('hex');
			console.log(user.token);
			console.log(gToken);
			if(user.token !== null)
			{
				user.token = gToken;
				user.save(function (err) {if (err) console.log ('Error on save!')});
				_res.json({token: gToken});
			}
			
		}
		else {
			_res.status(421);
			_res.json({error: 'AuthCode not found'});
			_res.end();
		}
	});
});

router.get('/me', function(req, res){
	var rToken = url.parse(req.url,true).query.token;
	var query = PUser.findOne({'token': rToken});
	var _res = res;

	query.exec(function(err, user) {
		if (!err) {
			console.log(user.name.firstname);
			_res.json({
				user:{
					firstname: user.name.firstname, 
					lastname: user.name.lastname
				}
			});
		}
		else{
			_res.status(421);
			_res.json({error: 'token not found'});
		}
	});
});


router.get('/token-validation', function(req, res) {
	var rToken = url.parse(req.url,true).query.token;
	
	var _res = res;

	var query = PUser.findOne({'token': rToken});
	query.exec(function(err, user) {
		if (!err) {
			_res.status(200);
			_res.end();
		}
		else {
			_res.status(421);
			_res.json({error: 'Token not found'});
			_res.end();
		}
	});
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);