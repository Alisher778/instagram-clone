var express       = require('express');
var app           = express();
var Sequelize     = require('sequelize');
var databaseURL   = 'sqlite://database.sqlite3';
var sequelize     = new Sequelize(process.env.DATABASE_URL || databaseURL);
var fs            = require('fs');
var http          = require('http');
var pg            = require('pg');
var aws           = require('aws-sdk');
var multer        = require('multer');
var multerS3      = require('multer-s3');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var passwordHash  = require('password-hash');
var session       = require('express-session');
var moment        = require('moment');
var passport      = require('passport');
var Strategy      = require('passport-local').Strategy;
var flash         = require('connect-flash');
var moment        = require('moment');

aws.config.update({
    secretAccessKey: process.env.SECRETACCESSKEY,
    accessKeyId: process.env.ACCESSKEYID,
    region: 'us-east-1'
});



    var s3 = new aws.S3();

    var userUpload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'clone-of-instagram/users',
            key: function (req, file, cb) {
                console.log(file);
                cb(null, Date.now() + file.originalname);
            }
        })
    });

    var postUploads = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'clone-of-instagram/uploads',
            key: function (req, file, cb) {
                console.log(file);
                cb(null, Date.now() + file.originalname);
            }
        })
    });

    
//
// var userStorage = multer.diskStorage({
//         destination: function(req, file, cb) {
//             charb(null, './public/images/users')
//         },
//         filename: function(req, file, cb) {
//             cb(null, Date.now() + file.originalname);
//         }
//     });

//     var userUpload = multer({
//         storage: userStorage
//     });

//     var storage = multer.diskStorage({
//         destination: function(req, file, cb) {
//             cb(null, './public/images/uploads')
//         },
//         filename: function(req, file, cb) {
//             cb(null, Date.now() + file.originalname);
//         }
//     })

//     var postUploads = multer({
//         storage: storage
//     });

// 

app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3000));
app.set('trust proxy', 1) // trust first proxy 

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
// app.use(require('connect-multiparty')());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));



// Users sign up Page ------------
var User = sequelize.define('user', {
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    fullName: Sequelize.STRING,
    userName: {
        type: Sequelize.STRING,
        unique: true
    },
    password: Sequelize.STRING,
    images: Sequelize.STRING
});


var Uploads = sequelize.define('upload', {
    image: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    fileName: Sequelize.STRING,
    mimetype: Sequelize.STRING,
    userId: Sequelize.INTEGER,
    userEmail: Sequelize.STRING,
    avatar: Sequelize.STRING
});

var Comments = sequelize.define('comments', {
    comment: Sequelize.TEXT,
    uploadId: Sequelize.INTEGER,
    userId: Sequelize.INTEGER,
    userEmail: Sequelize.STRING
});

var Like = sequelize.define('like', {
    like: Sequelize.INTEGER,
    uploadId: Sequelize.INTEGER
});

User.hasMany(Uploads);
Uploads.belongsTo(User);
Uploads.hasMany(Comments);
Comments.belongsTo(Uploads);
Comments.belongsTo(User);
User.hasMany(Comments);

app.get('/', function(req, res) {
    res.render('users/new');

});

// User info for Show Page
app.post('/user/sign_up', userUpload.single('images'), function(req, res) {
    console.log(req.file);
    sequelize.sync().then(function() {
        return User.create({
            email: req.body.email,
            fullName: req.body.fullName,
            userName: req.body.userName.toString().toLowerCase(),
            password: passwordHash.generate(req.body.password),
            images: req.file.location
        }).then(function(users) {
            req.session.userId = users.id;
            req.session.userEmail = users.userName;
            req.session.avatar = users.images;
            res.redirect('/home');
        });
    });
});

app.get('/login', function(req, res){
    res.render('login')
})

app.post('/login', function(req, res){
    let email = req.body.email;
    let password = req.body.password;
    
    User.count({where:{email:email}}).then(function (count){
        if(!count == 0){
            User.findOne({
                where: {email: email}
            }).then(function(users){
                var pass = passwordHash.verify(req.body.password, users.password);
                if(pass){
                    req.session.userId = users.id;
                    req.session.userEmail = users.userName;
                    req.session.avatar = users.images;
                    res.redirect('/home')
                }else{
                    res.render('login');
                }
            
            });
        }else{
            res.send('Wrong Email');
        }
    });
});

app.get('/logout', function(req, res){
    req.session.userId = null;
    res.redirect('/login');
});

app.use(function(req, res, next) {
  if (req.session.userId){
    next();
    return;
  }
    res.redirect('/login');
    
});

//get users list
app.get('/users', function(req, res) {
    User.findAll().then(function(users) {
        res.render('users/index', {
            user: users, current_user: req.session.userEmail
        });
    });
});

app.get('/users/:id', function(req, res) {
    var id = req.params.id;
    User.findById(id).then(function(users) {
        res.render('users/show', {
            user: users, moment: moment, current_user: req.session.userId
        });
    });
});

// app.get('/users/:current_user', function(req, res) {
//     User.findAll({where: {userName: req.session.userEmail }}).then(function(users) {
//         res.render('users/show', {
//             user: users, moment: moment, current_user: req.session.userEmail
//         });

//     });
// });

//-----------Upload page starts here -----------------------------------

//Get all uploaded images
app.get('/home', function(req, res) {
    Uploads.findAll({
        order: '"createdAt" DESC'
    }).then(function(uploads) {
        res.render('uploads/index', {
            upload: uploads, moment: moment, current_user: req.session.userId
        })
        console.log(req.session.userId)
    });
});


//New Uploads page
app.get("/uploads", function(req, res) {
    res.render('uploads/new', {current_user: req.session.userId});
});

//Create upload images page
app.post('/images/upload', postUploads.single('image'), function(req, res) {
    sequelize.sync().then(function() {
        return Uploads.create({
            image: req.file.location,
            title: req.body.title,
            description: req.body.description,
            mimetype: req.file.mimetype,
            fileName: Date.now() + req.file.originalname,
            userId: req.session.userId,
            userEmail: req.session.userEmail,
            avatar: req.session.avatar
        }).then(function(uploads) {
            res.redirect('/home');
        });
    });
});


//Downloading images
app.get('/images/:id', function(req, res) {
    var id = req.params.id;
    var file = req.file.location;
    console.log(file);
    res.download(file);
})

app.get('/uploads/:id', function(req, res) {
    Uploads.findById(req.params.id).then(function(uploads) {
        res.render('uploads/edit', {
            upload: uploads, current_user: req.session.userEmail
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
app.get('/delete/:id/:file', function(req, res) {
    var id  = req.params.id;
    var file = req.params.file;
    Uploads.destroy({
        where: {
            id: id
        }
    }).then(function() {
        var s3 = new aws.S3();
        var params = {
            Bucket: 'clone-of-instagram/uploads',
            Key: file
        };
        s3.deleteObject(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else     console.log(data);           // successful response
        });

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
    sequelize.sync().then(function() {
        return Comments.create({
            comment: req.body.comment,
            uploadId: id,
            userId: req.session.userId,
            userEmail: req.session.userEmail
        }).then(function(comments) {

            res.redirect('/home#' + id + 's')
        });
    });
});

app.get('/comments/:id', function(req, res) {
    var id = req.params.id;
    Comments.findAll({
        where: {
            uploadId: id
        }
    }).then(function(comment) {
        res.send(comment);
    })
});


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});