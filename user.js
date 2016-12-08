var Sequelize = require('sequelize');
  var databaseURL = 'sqlite://database.sqlite3';
  var Uploads = require('./uploads')
  var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
  var passwordHash = require('password-hash');
  
  var User = sequelize.define('user',{
        email: Sequelize.STRING,
        fullName: Sequelize.STRING,
        userName: Sequelize.STRING,
        password: Sequelize.STRING,
        images: Sequelize.STRING
    });
  // User.hasMany(Uploads)
  module.exports = User;