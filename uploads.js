var Sequelize = require('sequelize');
var databaseURL = 'sqlite://database.sqlite3';
var User = require('./user');
var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
var passwordHash = require('password-hash');
 
var Uploads = sequelize.define('upload', {
  image: Sequelize.STRING,
  title: Sequelize.STRING,
  description: Sequelize.TEXT
});
// Uploads.belongsTo(User);

module.exports = Uploads;