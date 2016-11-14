var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/user');
var Location = require('../models/location');
var Message = require('../models/message');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
var session = require('express-session');
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(session({secret:'somesecrettokenhere'}));



router.get('/', function (req, res) {
    console.log("---------/session-----------", req.session)
   // res.render('index');

    if (req.session.user) {

        Location.findAll()
        .then(function(locations){
            res.render('index',{ user: req.session.user, locations:locations});
        })


    } else if(req.session.passport){
        Location.findAll()
        .then(function(locations){
            res.render('index',{ user: req.session.passport.user, locations:locations});
        })
    }else{

    console.log("---------/innnnnsession-----------", req.session);
        res.render('index', {signin: req.session.signin});

    }

});

router.get('/user', function (req, res, next) {
    if (req.session.user) {
        //user = Object.assign({}, req.session.user, {birth:req.session.user.birth.format('YYY-MM-DD')});
        res.render('user',{ user: req.session.user});

    }else if(req.session.passport){
        //.format('yyyy-MM-dd')

        res.render('user',{ user: req.session.passport.user});

    }else{
        res.redirect('/');//render('index', {signin: req.session.signin});

    }
});

router.get('/user/signin', function (req, res, next) {
    //console.log(req.body.user);
     req.session.signin = true;
     res.json({success:true});
});
router.get('/user/signup', function (req, res, next) {
    //console.log(req.body.user);
     req.session.signin = false;
     res.json({success:true});
});
router.post('/user/create', function (req, res, next) {
    //console.log(req.body.user);
    User.register(req.body.user)
    .then(function(user){
        req.session.user = user;
        res.json({success:true});

    })
});

router.post('/user/logout', function (req, res, next) {

    if(req.session.user){

        req.session.user = null;
        res.json({ success: true});

    }else{
        req.session.destroy(function(e){

            console.log("logout");
            req.logout();
            res.json({success:true});
        });

    }
});
router.post('/user/login', function (req, res, next) {
    console.log("login-----------------------");
    User.findOne({
        where:{
            username: req.body.username,
            password: req.body.password
        }
    })
    .then(function(user){
        if(user){
            console.log("success-----------------------");
            req.session.user = user;
            res.json({ success: true});
        }else{
            res.json({success: false, message:"User not found!"})
        }

    })
});

router.get('/user/edit', function (req, res, next){
    if (req.session.user) {
        //user = Object.assign({}, req.session.user, {birth:req.session.user.birth.format('YYY-MM-DD')});
        res.render('edit',{ user: req.session.user});

    }else if(req.session.passport){
        //.format('yyyy-MM-dd')

        res.render('edit',{ user: req.session.passport.user});

    }else{
        res.redirect('/');//render('index', {signin: req.session.signin});

    }
})
router.put('/user/edit', function (req, res, next){
    console.log("backend--------------------------",   req.body );
    console.log("user--------------------------", req.session.user);
    if(req.session.passport){
        User.findById(req.session.passport.user.id)
        .then(function(user){
            //console.log("find user passport--------------------------", user)
           return  user.update({
                gender: req.body.gender,
                birth: req.body.birth,
                phone: req.body.phone
            })
        })
        .then(function(user){
            console.log("passport success--------------------------", user);
            req.session.passport.user = user;
            res.json({success:true, user: user})
        })

    }else{
        User.findById(req.session.user.id)
        .then(function(user){
            //console.log("find user--------------------------", user)
           return  user.update({
                password: req.body.password,
                email: req.body.email,
                name: req.body.name
            })
        })
        .then(function(user){
            console.log("session success--------------------------", user);
            req.session.user = user;
            res.json({success:true, user: user})
        })

    }

})

router.get('/user/trips', function (req, res, next){
    if(req.session.user){
        res.render('trip',{ user: req.session.user});
    }else if(req.session.passport){
        res.render('trip',{ user: req.session.passport.user});
    }else{
        res.redirect('/');
    }

})


router.get('/user/message', function (req, res, next){

    if(req.session.user){
        console.log("user");
        res.render('message',{ user: req.session.user});
    }else if(req.session.passport){
        res.render('message',{ user: req.session.passport.user});
    }else{
        res.redirect('/');
    }

})
router.get("/user/:id", function (req, res, next){
    //console.log("id--------",req.params.id);
    User.findById(req.params.id)
    .then(function(user){
        //console.log("find user", user);
        res.json({success:true, user:user});
    })
})

router.post("/message", function (req, res, next){
    console.log("post mst")
    var msg = Message.create({content:req.body.img, isRead:false, toId:req.body.toId, fromId:req.body.fromId});
    // var from = User.findById(req.body.fromId);
    // var to = User.findById(req.body.toId);
    // Promise.all([msg, from, to])
    // .then(function([msg, from, to]){
    //     msg.setTo(to);
    //     msg.setFrom(from);
    //     return msg;
    // })
    // .then(function(msg){
        //console.log("res----------",msg);
        res.json({success:true});
    // })



})
router.get("/api/user/:name", function (req, res, next){
    User.findAll({where:{name:req.params.name}})
    .then(function(user){
        console.log("get user return id", user)
        res.json({user:user});
    })
})
router.get("/api/message", function (req, res, next){
    //console.log("main--", req.query.userId);


    var toUser = Message.findAll({include:[{model: User, as:"to", where:{id: req.query.userId}},{model: User, as:"from"}]});
    var fromUser = Message.findAll({include:[{model: User, as:"to"},{model: User, as:"from", where:{id: req.query.userId}}]});

    Promise.all([toUser, fromUser])
    .then(function([msgsTo, msgsFrom]){
        var users = [];
        var usersId = [];
         msgsTo.forEach(function(msg){
            if(!usersId.includes(msg.fromId)){
                users.push(msg.from);
                usersId.push(msg.fromId);
               // console.log("push", msg.fromId);
            }else{
               // console.log("same", msg.fromId);
            }
         });
         msgsFrom.forEach(function(msg){
            if(!usersId.includes(msg.toId)){
                users.push(msg.to);
                usersId.push(msg.toId);
               // console.log("push", msg.toId);
            }else{
               // console.log("same", msg.toId);
            }
         })
        res.json({success:true, users:users});
    })

})

router.get("/message/:fromId/:toId", function (req, res, next){
    console.log("load msg");
    Message.findAll({where:{$or:[{fromId:req.params.fromId, toId:req.params.toId}, {fromId:req.params.toId, toId: req.params.fromId }]}, include:[{model: User, as:"to"},{model: User, as:"from"}]})
    .then(function(msgs){
        console.log("msgs---------------------", msgs);
        res.json({success:true ,messages: msgs});
    })
})

//find unread user
router.get("/message/:fromId/:toId/isRead", function (req, res, next){

    Message.findAll({where:{fromId:req.params.fromId, toId:req.params.toId, isRead:false}, include:[{model: User, as:"to"},{model: User, as:"from"}]})
    .then(function(msgs){
        console.log("ISREAD find it", msgs);
        if(msgs.length >0){
            res.json({success:true ,isRead: false, msgs:msgs});
        }else{
             res.json({success:true ,isRead: true});
        }

    })
})

//update to read
router.put("/message/:fromId/:toId/isRead", function (req, res, next){

    Message.findAll({where:{fromId:req.params.fromId, toId:req.params.toId, isRead:false}, include:[{model: User, as:"to"},{model: User, as:"from"}]})
    .then(function(msgs){
        console.log("find update", msgs);
        msgs.forEach(function(msg){
            msg.update({isRead:true})
        })
        res.json({success:true});

    })
})

router.get('/api/locations', function (req, res, next){
    Location.findAll()
    .then(function(locations){
        res.json({locations:locations});
    })
})

router.get('/api/users', function (req, res, next){
    var name = '%'+req.query.name+'%';
    if(name.length != 2){
        User.findAll({ where: { name: { $like: name , $ne:req.query.user} ,}})
        .then(function(users){
          res.json({success:true, users:users});

        })
    }

})



// router.get('/test', function(req, res, next){
//     if(req.session.passport){
//         console.log("session in", req.session);
//         //res.json({message:"find it", user:req.user});
//         res.render('test', {user: req.session.passport.user});
//     }else{
//         console.log("session out", req.session);

//         res.render('test');
//     }
// })
// router.get('/log', function(req, res, next){


//     req.session.destroy(function(e){

//         console.log("logout");
//         req.logout();
//         res.json({success:true, user: null});
//     });
// })





module.exports = router;





