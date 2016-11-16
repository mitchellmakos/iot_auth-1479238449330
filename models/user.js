var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost/users');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	customer_name: {
		type: String
	},
	auth_token: {
		type: String
	},
	username: {
		type: String,
        index: true
	},
    password: {
		type: String
	},
	dev_id_1: {
		type: String
	},
	dev_id_2: {
		type: String
	},
    dev_id_3: {
		type: String
	},
    dev_id_4: {
		type: String
	},
    dev_id_5: {
		type: String
	},
    dev_id_6: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash;
   			newUser.save(callback);
    	});
	});
}