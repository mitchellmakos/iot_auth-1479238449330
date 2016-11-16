var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var vcapServices = require('../vcapServices');
var cloudant_service = vcapServices.cloudantNoSQLDB[0].credentials;
var cloudant = Cloudant({account:cloudant_service.username, password:cloudant_service.password});
var db = cloudant.db.use('users');
var bcrypt = require('bcryptjs');

var newUser = {
		id : null,
		company: null,
		name: null,
		title: null,
		email: null,
		phone: null,
        auth_token: null,
        username: null,
        password: null,
        dev_id_1: null,
        dev_id_2: null,
        dev_id_3: null,
        dev_id_4: null,
        dev_id_5: null,
        dev_id_6: null
	};

var getUserById = function(id, callback){
	var query = {id: id};
	db.find(query, callback);
};

var getUserByUsername = function(username, callback){
	var query = {username: username};
	db.find(query, callback);
};

var comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login',{title: 'Login'});
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid Username of Password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/');
});


var createUser = function(company, name, title, email, phone, auth_token, username, password, dev_id_1, dev_id_2, dev_id_3, dev_id_4, dev_id_5, dev_id_6) {
	   	//	encrypting password
		bcrypt.genSalt(10, function(err, salt) {
	   	bcrypt.hash(password, salt, function(err, hash) {
				password = hash;
   			});
		});
		
		var user = newUser;
		user.company = company;
		user.name = name;
		user.title = title;
		user.email = email;
		user.phone = phone;
		user.auth_token = auth_token;
		user.username = username;
		user.password = password;
		user.dev_id_1 = dev_id_1;
		user.dev_id_2 = dev_id_2;
		user.dev_id_3 = dev_id_3;
		user.dev_id_4 = dev_id_4;
		user.dev_id_5 = dev_id_5;
		user.dev_id_6 = dev_id_6;
					   			
	db.insert(user, email, function(err, doc){
		if(err) {
			console.log(err);
			response.sendStatus(500);
		} else
			response.sendStatus(200);
		response.end()
	});
}

router.post('/users', function(req, res, next) { 
	var company = req.body.company;
	var name = req.body.name;
	var title = req.body.title;
	var email = req.body.email;
	var phone = req.body.phone;
	var auth_token = req.body.auth_token;
	var username = req.body.username;
	var password = req.body.password;
	var dev_id_1 = req.body.dev_id_1;
	var dev_id_2 = req.body.dev_id_2;
	var dev_id_3 = req.body.dev_id_3;
	var dev_id_4 = req.body.dev_id_4;
	var dev_id_5 = req.body.dev_id_5;
	var dev_id_6 = req.body.dev_id_6;
   
     // Form Validator
     req.checkBody('company','Company Name field is required').notEmpty();
     req.checkBody('name','Company Name field is required').notEmpty();
     req.checkBody('title','Company Name field is required').notEmpty();
     req.checkBody('email','Company Name field is required').isEmail();
	 req.checkBody('company','Company Name field ').notEmpty();
	 req.checkBody('auth_token','Auth Token field iis requireds required').notEmpty();
	 req.checkBody('username','Username field is required').notEmpty();
	 req.checkBody('password','Password field is required').notEmpty();
	 req.checkBody('password2','Passwords do not match').equals(req.body.password);
	 req.checkBody('dev_id_1','You need to register at least 1 device').notEmpty();
	 
	 // Check Errors
	  var errors = req.validationErrors();
	
	  if(errors){
	  	res.render('register', {
	  		errors: errors
	  	});
	  } else{
	  createUser(null, company, name, title, email, phone, auth_token, username, password, dev_id_1, dev_id_2, dev_id_3, dev_id_4, dev_id_5, dev_id_6, res);	
      req.flash('sucess', 'You are now registered and can login');
      res.location('/');
      res.redirect('/');
  }
});

router.get('/users/all_docs', function(request, response) {
    var doc = request.query.id;
    var key = request.query.key;

    db.users.get(doc, key, function(err, body) {
        if (err) {
            response.status(500);
            response.setHeader('Content-Type', 'text/plain');
            response.write('Error: ' + err);
            response.end();
            return;
        }

        response.status(200);
        response.setHeader("Content-Disposition", 'inline; filename="' + key + '"');
        response.write(body);
        response.end();
        
        passport.serializeUser(function(user, done) {
		  done(null, user.id);
		});
		
		passport.deserializeUser(function(id, done) {
		  getUserById(id, function(err, user) {
		    done(err, user);
		  });
		});
		
		passport.use(new LocalStrategy(function(username, password, done){
		  getUserByUsername(username, function(err, user){
		    if(err) throw err;
		    if(!user){
		      return done(null, false, {message: 'Unknown User'});
		    }
		
		    comparePassword(password, user.password, function(err, isMatch){
		      if(err) return done(err);
		      if(isMatch){
		        return done(null, user);
		      } return done(null, false, {message:'Invalid Password'}); 
		        
		    });
		  });
		}));
        
    });
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
