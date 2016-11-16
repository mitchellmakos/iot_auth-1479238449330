var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

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
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

router.post('/register', function(req, res, next) {
  var org_name = req.body.org_name;
  var auth_token = req.body.auth_token;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var dev_id_1 = req.body.dev_id_1;
  var dev_id_2 = req.body.dev_id_2;
  var dev_id_3 = req.body.dev_id_3;
  var dev_id_4 = req.body.dev_id_4;
  var dev_id_5 = req.body.dev_id_5;
  var dev_id_6 = req.body.dev_id_6;
  


  // Form Validator
  req.checkBody('org_name','Organization Name field is required').notEmpty();
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
  	var newUser = new User({
        org_name: org_name,
        auth_token: auth_token,
        username: username,
        password: password,
        dev_id_1: dev_id_1,
        dev_id_2: dev_id_2,
        dev_id_3: dev_id_3,
        dev_id_4: dev_id_4,
        dev_id_5: dev_id_5,
        dev_id_6: dev_id_6
    });
      
    User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
    });
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
