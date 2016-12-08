var express = require('express');
var app = express();
var Sequelize = require('sequelize');
var User = require('./user');
var Uploads = require('./uploads');
var databaseURL = 'sqlite://database.sqlite3';
var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
var fs = require('fs');
var http = require('http');
var port = 3000;

var multer = require('multer');
//User profile folder
var userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/users')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})
var upload = multer({ storage: userStorage });

// Image uploads

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})
var ImageUpload = multer({ storage: storage });


var bodyParser = require('body-parser');
var passwordHash = require('password-hash');


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home page of Instagram page
app.get('/home', function(req, res){
    res.render('pages/index');
});

// Users sign up Page ------------
 var User = sequelize.define('user',{
        email: Sequelize.STRING,
        fullName: Sequelize.STRING,
        userName: Sequelize.STRING,
        password: Sequelize.STRING,
        images: Sequelize.STRING
    });
 
 var Uploads = sequelize.define('upload', {
  image: Sequelize.STRING,
  title: Sequelize.STRING,
  description: Sequelize.TEXT
});

app.get('/', function(req, res){
    res.render('users/new');
});

//Post the USer info for Show Page
app.post('/user/sign_up', upload.single('images'), function(req, res){
    sequelize.sync().then(function(){
        return User.create({
            email: req.body.email,
            fullName: req.body.fullName,
            userName: req.body.userName,
            password: passwordHash.generate(req.body.password),
            images: req.file.filename
        }).then(function(users){
            res.redirect('/home');
        });
    });
});

//get users list
app.get('/users', function(req, res){
    User.findAll().then(function(users){
        res.render('users/index', {user: users});
    });
});


//-----------Upload page starts here -----------------------------------

//New Uploads page
app.get("/uploads", function(req,res){
    res.render('uploads/new');
});

//Create upload images page
app.post('/images/upload', ImageUpload.single('image'), function(req,res){
    sequelize.sync().then(function(){
        return Uploads.create({
            image: req.file.filename,
            title: req.body.title,
            description: req.body.description
        }).then(function(uploads){
            res.redirect('/images');
            console.log(req.files);
        });
    });
});

//Get all uploaded images
app.get('/images', function(req, res){
    Uploads.findAll().then(function(uploads){
        res.render('uploads/index', {upload: uploads})
    });
});

//Downloading images
app.get('/images/:id', function(req, res){
    var id = req.params.id;
    var file =__dirname +'/public/images/uploads/' + id;
    res.download(file);
})

app.get('/uploads/:id', function(req, res){
    Uploads.findById(req.params.id).then(function(uploads){
        res.render('uploads/edit', {upload: uploads});
    });
});

//Update the uploads page
app.post('/uploads/edit',ImageUpload.single('image'), function(req, res){
    Uploads.findById(req.params.id).then(function(uploads){
        return uploads.Update({
            image: req.file.filename,
            title: req.body.title,
            description: req.body.description
        }).then(function(uploads){
            res.redirect('/images');
        });
    });
});

//Delete Uploads file
app.get('/delete/:image/:id', function(req, res){
    var id = req.params.id;
    var image = req.params.image;
    var file =__dirname +'/public/images/uploads/' + image;
    Uploads.destroy({
        where: {
            id: id
        }
    }).then(function(){
       fs.unlink(file);
        res.redirect('/images');
    });
});

app.listen(port, function(){
  console.log('Server started on port'+port);
});
