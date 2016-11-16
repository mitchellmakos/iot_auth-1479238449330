var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var vcapServices = require('./vcapServices');
var cloudant_service = vcapServices.cloudantNoSQLDB[0].credentials;
var cloudant = Cloudant({account:cloudant_service.username, password:cloudant_service.password});
var db = cloudant.db.use('users');
var bcrypt = require('bcryptjs');

var newUser = {
		id : undefined,
		company: req.body.company,
		name: req.body.name,
		title: req.body.title,
		email: req.body.email,
		phone: req.body.phone,
        auth_token: req.body.auth_token,
        username: req.body.username,
        password: req.body.password,
        dev_id_1: req.body.dev_id_1,
        dev_id_2: req.body.dev_id_2,
        dev_id_3: req.body.dev_id_3,
        dev_id_4: req.body.dev_id_4,
        dev_id_5: req.body.dev_id_5,
        dev_id_6: req.body.dev_id_6
	};

var getUserById = function(id, callback){
	var query = {id: id};
	db.find(query, callback);
};

var getUserByUsername = function(username, callback){
	var query = {username: username};
	db.finde(query, callback);
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

var createUser = function(id, company, name, title, email, phone, auth_token, username, password, dev_id_1, dev_id_2, dev_id_3, dev_id_4, dev_id_5, dev_id_6) {
	if(newUser.id === undefined) {
		// Generated random id
		newUser.id = '';
	}
	//	encrypting password
	bcrypt.genSalt(10, function(err, salt) {
	   	bcrypt.hash(password, salt, function(err, hash) {
				password = hash;
   			});
		});
   			
	db.insert({
		company: company,
		name: name,
		title: title,
		email: email,
		phone: phone,
        auth_token: auth_token,
        username: username,
        password: password,
        dev_id_1: dev_id_1,
        dev_id_2: dev_id_2,
        dev_id_3: dev_id_3,
        dev_id_4: dev_id_4,
        dev_id_5: dev_id_5,
        dev_id_6: dev_id_6
	}, id, function(err, doc){
		if(err) {
			console.log(err);
			response.sendStatus(500);
		} else
			response.sendStatus(200);
		response.end()
	});
}

router.post('/register', function(req, res, next) { 
	var id : undefined;
	var company: req.body.company;
	var name: req.body.name;
	var title: req.body.title;
	var email: req.body.email;
	var phone: req.body.phone;
	var auth_token: req.body.auth_token;
	var username: req.body.username;
	var password: req.body.password;
	var dev_id_1: req.body.dev_id_1;
	var dev_id_2: req.body.dev_id_2;
	var dev_id_3: req.body.dev_id_3;
	var dev_id_4: req.body.dev_id_4;
	var dev_id_5: req.body.dev_id_5;
	var dev_id_6: req.body.dev_id_6;
   
     // Form Validator
     req.checkBody('company','Company Name field is required').notEmpty();
     req.checkBody('name','Company Name field is required').notEmpty();
     req.checkBody('title','Company Name field is required').notEmpty();
     req.checkBody('email','Company Name field is required').isEmail();
	 req.checkBody('company','Company Name field is required').notEmpty();
	 req.checkBody('auth_token','Auth Token field is required').notEmpty();
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

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
