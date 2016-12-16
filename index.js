var express = require('express');
var app = express();
var Sequelize = require('sequelize');
var User = require('./user');
var Uploads = require('./uploads');
var databaseURL = 'sqlite://database.sqlite3';
var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
var fs = require('fs');
var http = require('http');
var pg = require('pg');
var s3 = require( 'multer-storage-s3' );
require( 'dotenv' ).load();
var multer = require('multer');
//User profile folder
var userStorage = s3({
    destination : function( req, file, cb ) {
        
        cb( null, './public/images/users' );
        
    },
    filename    : function( req, file, cb ) {
        
        cb( null, Date.now() + file.originalname );
        
    },
    bucket      : 'bucket-name',
    region      : 'us-west-2'
});

var upload = multer({ storage: userStorage });

var userStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/users')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})
var upload = multer({
    storage: userStorage
});

// Image uploads
var storage = s3({
    destination : function( req, file, cb ) {
        
        cb( null, './public/images/uploads' );
        
    },
    filename    : function( req, file, cb ) {
        
        cb( null, Date.now() + file.originalname );
        
    },
    bucket      : 'bucket-name',
    region      : 'us-west-2'
});
var ImageUpload = multer({ storage: storage });

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
})
var ImageUpload = multer({
    storage: storage
});


var bodyParser = require('body-parser');
var passwordHash = require('password-hash');


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('port', (process.env.PORT || 3000));


// Users sign up Page ------------
var User = sequelize.define('user', {
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

var Comments = sequelize.define('comments', {
    comment: Sequelize.TEXT,
    uploadId: Sequelize.INTEGER
});

var Like = sequelize.define('like',{
    like: Sequelize.INTEGER,
    uploadId: Sequelize.INTEGER
})

Uploads.hasMany(Comments);
Comments.belongsTo(Uploads);


app.get('/', function(req, res) {
    res.render('users/new');
});

//Post the USer info for Show Page
app.post('/user/sign_up', upload.single('images'), function(req, res) {
    sequelize.sync().then(function() {
        return User.create({
            email: req.body.email,
            fullName: req.body.fullName,
            userName: req.body.userName,
            password: passwordHash.generate(req.body.password),
            images: req.file.filename
        }).then(function(users) {
            res.redirect('/home');
        });
    });
});

//get users list
app.get('/users', function(req, res) {
    User.findAll().then(function(users) {
        res.render('users/index', {
            user: users
        });
    });
});


//-----------Upload page starts here -----------------------------------

//New Uploads page
app.get("/uploads", function(req, res) {
    res.render('uploads/new');
});

//Create upload images page
app.post('/images/upload', ImageUpload.single('image'), function(req, res) {
    sequelize.sync().then(function() {
        return Uploads.create({
            image: req.file.filename,
            title: req.body.title,
            description: req.body.description
        }).then(function(uploads) {
            res.redirect('/home');
            console.log(req.file.path);
        });
    });
});

//Get all uploaded images
app.get('/home', function(req, res) {
    Uploads.findAll({order: '"createdAt" DESC'}).then(function(uploads) {
        res.render('uploads/index', {
            upload: uploads
        })
    });
});

//Downloading images
app.get('/images/:id', function(req, res) {
    var id = req.params.id;
    var file = __dirname + '/public/images/uploads/' + id;
    res.download(file);
})

app.get('/uploads/:id', function(req, res) {
    Uploads.findById(req.params.id).then(function(uploads) {
        res.render('uploads/edit', {
            upload: uploads
        });
    });
});

//Update the uploads page
app.post('/uploads/edit/:id', function(req, res) {
    Uploads.update({
            title: req.body.title,
            description: req.body.description
        },

        {
            where: {
                id: req.params.id
            }

        }).then(function() {
        res.redirect('/home');
    });

});

//Delete Uploads file
app.get('/delete/:image/:id', function(req, res) {
    var id = req.params.id;
    var image = req.params.image;
    var file = __dirname + '/public/images/uploads/' + image;
    Uploads.destroy({
        where: {
            id: id
        }
    }).then(function() {
        fs.unlink(file);
        Comments.destroy({
            where: {
                uploadId: id
            }
        })
        res.redirect('/home');
    });
});


//Comments
app.get('/home', function(req, res) {
    res.render('uploads/index');
});

app.get('/comments', function(req, res) {
    Comments.findAll().then(function(comment) {
        res.send(comment)
    });

});

app.post('/comments/:uploadID/post', function(req, res) {
    var id = req.params.uploadID;
    console.log(id);
    sequelize.sync().then(function() {
        return Comments.create({
            comment: req.body.comment,
            uploadId: id
        }).then(function(comments) {
            
            res.redirect('/home#'+id+'s')
        });
    });
});

app.get('/comments/:id', function(req, res){
    var id = req.params.id;
    Comments.findAll({where: {
        uploadId: id
        }
    }).then(function(comment){
        res.send(comment);
    })
});


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

