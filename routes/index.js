var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/contacts';
var contacts;
var responseview;

MongoClient.connect(url, function(err, db) {
  console.log("Connected to database");
  contacts = db.collection('contacts');
});

var mailerform = function(req, res, next) {
  res.render('form', { });
}

var ensureLoggedIn = function(req, res, next) {
	if ( req.user ) {
		next();
	}
	else {
		res.redirect("/login");
	}
}

/* GET form page. */
router.get('/', mailerform);
router.get('/mailer', mailerform);

router.post('/mailer', function(req, res, next) {
  var geocoder = require('node-geocoder')('google', 'http');
  var address = req.body.street + " " + req.body.city + " " + req.body.state;

  geocoder.geocode( address, function(err, geo_res) {
    var lat = geo_res[0].latitude;
    var lng = geo_res[0].longitude;
    var street = geo_res[0].streetNumber + " " + geo_res[0].streetName;
    var city = geo_res[0].city;

    contacts.insert({
      honorific:req.body.honorific,
      first:req.body.first,
      last:req.body.last,
      street:street,
      city:city,
      state:req.body.state,
      zip:req.body.zip,
      phone:req.body.phone,
      email:req.body.email,
      byphone:req.body.byphone,
      bymail:req.body.bymail,
      byemail:req.body.byemail,
      byany:req.body.byany,
      latitude:lat,
      longitude:lng

    }, function(err, doc) {
      if (doc.result.ok) {
        res.render('confirmation', { name:req.body.first });
      }
    });
  });
});

router.post('/contacts', ensureLoggedIn, function(req, res, next) {
  if(req.body.command == "delete") {
    console.log("deleting");
    contacts.remove( { _id : ObjectID(req.body.objectid) }, function(err, numdoc) {
      contacts.find().toArray(function (err, result) {
        res.render ('contacts', {contactlist: result})
      });
    });
  }
  else{
    console.log("updating");
    var geocoder = require('node-geocoder')('google', 'http');
    var address = req.body.street + " " + req.body.city + " " + req.body.state;

    geocoder.geocode( address, function(err, geo_res) {
      var lat = geo_res[0].latitude;
      var lng = geo_res[0].longitude;
      var street = geo_res[0].streetNumber + " " + geo_res[0].streetName;
      var city = geo_res[0].city;

      contacts.update( { _id : ObjectID(req.body.contactid) }, {
        honorific:req.body.honorific,
        first:req.body.first,
        last:req.body.last,
        street:street,
        city:city,
        state:req.body.state,
        zip:req.body.zip,
        phone:req.body.phone,
        email:req.body.email,
        byphone:req.body.byphone,
        bymail:req.body.bymail,
        byemail:req.body.byemail,
        byany:req.body.byany,
        latitude:lat,
        longitude:lng

      }, function(err, doc) {
        contacts.find().toArray(function (err, result) {
          res.render ('contacts', {contactlist: result})
        });
      });
    });
  }
});

router.get('/contacts', ensureLoggedIn, function(req, res, next) {
  contacts.find().toArray(function (err, result) {
    res.render ('contacts', {contactlist: result})
  });
});

module.exports = router;
