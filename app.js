var express = require('express');
var app = express();
var Sequelize = require('sequelize');
var databaseURL = 'sqlite://database.sqlite3';
var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
var fs = require('fs');
var port = 3000;
var multer = require('multer');
var upload = multer({ dest: 'public/images/uploads/' })
var bodyParser = require('body-parser');
var passwordHash = require('password-hash');


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home page of Instagram page
app.get('/', function(req, res){
    res.render('pages/index');
});

// Users sign up Page ------------

// Get USer info from form
var User = sequelize.define('user',{
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.STRING,
        images: Sequelize.STRING
    });

app.get('/sign_up', function(req, res){
    res.render('users/new');
});

//Post the USer info for Show Page
app.post('/user/sign_up', upload.single('images'), function(req, res){
    sequelize.sync().then(function(){
        return User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash.generate(req.body.password),
            images: req.file.path
        }).then(function(users){
            res.render('users/show', {user:users});
            console.log(req.file);
        });
    });
})

//Upload page
app.get("/")

app.listen(port, function(){
  console.log('Server started on port'+port);
});
