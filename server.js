var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var bcrypt = require("bcrypt");
// bcrypt package would not load
var flash = require('connect-flash');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({ secret: 'cmps369'}))
app.use(express.static(path.join(__dirname, 'public')));

var username = "cmps369";
var password = "finalproject";

// Set up passport to help with user authentication (guest/password)
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },

    function(user, pswd, done) {
        if ( user != username || pswd != password ) {
            return done(null, false);
        }
        else {
          return done(null, true);
        }
      }
  ));

  passport.serializeUser(function(username, done) {
      // this is called when the user object associated with the session
      // needs to be turned into a string.  Since we are only storing the user
      // as a string - just return the username.
      done(null, username);
  });

  passport.deserializeUser(function(username, done) {
      // normally we would find the user in the database and
      // return an object representing the user (for example, an object
      // that also includes first and last name, email, etc)
      done(null, username);
   });


// Posts to login will have username/password form data.
// passport will call the appropriate functions...
routes.post('/login',
    passport.authenticate('local', { successRedirect: '/contacts',
                                     failureRedirect: '/login_fail',
                                  })
);

routes.get('/login', function (req, res) {
  res.render('login', {});
});

routes.get('/login_fail', function (req, res) {
  res.render('login_fail', {});
});

routes.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});


app.use('/', routes);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
