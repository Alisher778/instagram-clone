var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var databaseURL = 'sqlite://database.sqlite3';
var sequelize = new Sequelize(process.env.DATABASE_URL || databaseURL);
var fs = require('fs');
var http = require('http');
var pg = require('pg');
var aws = require('aws-sdk');
var multer = require('multer');
var s3 = require('multer-storage-s3');
var multerS3 = require('multer-s3');
var Comments = require('./comments');
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


var Uploads = sequelize.define('upload', {
    image: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.TEXT
});
Uploads.hasMany(Comments);
Comments.belongsTo(Uploads);

router.get("/uploads", function(req, res) {
    res.render('uploads/new');
});

//Create upload images page
router.post('/images/upload', ImageUpload.single('image'), function(req, res) {
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
router.get('/home', function(req, res) {
    Uploads.findAll({
        order: '"createdAt" DESC'
    }).then(function(uploads) {
        res.render('uploads/index', {
            upload: uploads
        })
    });
});

//Downloading images
router.get('/images/:id', function(req, res) {
    var id = req.params.id;
    var file = __dirname + '/public/images/uploads/' + id;
    res.download(file);
})

router.get('/uploads/:id', function(req, res) {
    Uploads.findById(req.params.id).then(function(uploads) {
        res.render('uploads/edit', {
            upload: uploads
        });
    });
});

//Update the uploads page
router.post('/uploads/edit/:id', function(req, res) {
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
router.get('/delete/:image/:id', function(req, res) {
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

module.exports = router;