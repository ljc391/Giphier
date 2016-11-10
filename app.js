var express = require( 'express' );

var http = require('http');
var app = express();
var routes = require('./routes');
var db = require('./models')
var User = require('./models/user');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var path = require('path');

var server = http.createServer(app);
var io = require('socket.io').listen(server);


app.use(bodyParser.urlencoded({extended: true}));

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
        done(null, user); // add user id to session (serialization)
      });
passport.deserializeUser(function (id, done) {
  User.findById(id)
  .then(function (user) {
    done(null, user);
  })
  .catch(function (err) {
    done(err);
  });
});
app.use(express.static('public'));
app.use('/', routes);

nunjucks.configure('views', {noCache: true});
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap/dist')));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')));






app.get('/auth/google', passport.authenticate('google', { scope : 'email' }));
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect : '/', // or wherever
    failureRedirect : '/' // or wherever
  }), function(req, res){ console.log("whtt",req.user);}
);


var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(
  new GoogleStrategy({
    clientID: '165926265835-8ut41ppa9s68bl708cv18dsp0cbfo3gr.apps.googleusercontent.com',
    clientSecret: 'sX5DYHXWsa3k_yuQ2kty32NO',
    callbackURL: '/auth/google/callback'
  },
  // Google will send back the token and profile
  function (token, refreshToken, profile, done) {
    //done(null);
    // the callback will pass back user profile information and each service (Facebook, Twitter, and Google) will pass it back a different way. Passport standardizes the information that comes back in its profile object.
    // console.log('---', 'in verification callback', profile, '---');
    // done();
    var info = {
      name: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos ? profile.photos[0].value : undefined
    };
    User.findOrCreate({
      where: {username:profile.id,password:"123", googleId: profile.id},
      defaults: info
    })
    .spread(function (user) {
      // passport.serializeUser(function (user, done) {
      //   done(null, user.id); // add user id to session (serialization)
      // });

      done(null, user);
    })
    .catch(done);
  })
);
// serve any other static files
io.on('connection', function(socket){

    //新user
    // socket.on('add user',function(msg){
    //     socket.username = msg;
    //     console.log("new user:"+msg+" logged.");
    //     io.emit('add user',{
    //         username: socket.username
    //     });
    // });

    //監聽新訊息事件
    socket.on('chat message', function(name, img, receiver){

        console.log(name+":"+img);

        //發佈新訊息
        io.emit('chat message', {
            name:name,
            img:img,
            receiver:receiver
        });
    });

    //left
    // socket.on('disconnect',function(){
    //     console.log(socket.username+" left.");
    //     io.emit('user left',{
    //         username:socket.username
    //     });
    // });


});




var port = 3000;
server.listen(port, function () {
  console.log('The server is listening closely on port', port);
  db.sync({})
  .then(function () {
    console.log('Synchronated the database');
  })
  .catch(function (err) {
    console.error('Trouble right here in River City', err, err.stack);
  });
});