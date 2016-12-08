
  var Sequelize = require('sequelize');
  var databaseURL = 'sqlite://database.sqlite3';
  var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
  var passwordHash = require('password-hash');
  
  var User = sequelize.define('user',{
        email: Sequelize.STRING,
        fullName: Sequelize.STRING,
        userName: Sequelize.STRING,
        password: Sequelize.STRING,
        images: Sequelize.STRING
    })
     
    var Uploads = sequelize.define('upload', {
        fileName: Sequelize.STRING,
        userId: Sequelize.INTEGER
  });

User.hasMany(Uploads)
Uploads.belongsTo(User);



module.exports = User;
module.exports = Uploads;