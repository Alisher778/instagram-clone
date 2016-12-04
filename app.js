var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var database = 'sqlite://databse.sqlite3';
var sequelize = new Sequelize(process.env.DATABASE_URL || database)
var cookieSession = require('cookie-session');
var passwordHash = require('password-hash');
var port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.get('/', function(req, res){
  res.send('Welcome to home Page');
});

var User = sequelize.define('user', {
        username: Sequelize.STRING,
        password: Sequelize.STRING
    });

app.get('/log_in', function(req,res){
    var post = req.body;
  if (post.username === User.findAOne({where:{req.body.username}}) && post.password === User.findOne({where:{post.password}})) {
    
    res.redirect('/');
  } else {
    res.send('Bad user/pass');
  }
});

app.get('/sing_up', function(req,res){
    var User = sequelize.define('user', {
        username: Sequelize.STRING,
        password: Sequelize.STRING
    });
    res.render('users/new');
});

app.post('/user/sign_up', function(req,res){
    sequelize.sync().then(function(){
        return User.create({
            username: req.body.username,
            password: passwordHash.generate(req.body.password)
        }).then(function(users){
            var hashedPassword = passwordHash.generate(req.body.password);
            console.log(hashedPassword);
            console.log(passwordHash.verify(req.body.password, hashedPassword));
            res.render('users/show', {user:users});
        });
    })
});

app.listen(port, function(){
  console.log('Server is running on  port' + port);
});