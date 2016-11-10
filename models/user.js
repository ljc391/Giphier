var Sequelize = require('sequelize');
var Promise = require('bluebird');
var db = require('./_db');

var User = db.define('user', {
  username:{
    type: Sequelize.STRING,
    allowNull: false
  },
  name:{
    type: Sequelize.STRING,
    allowNull: false
  },
  email:{
    type: Sequelize.STRING,
    allowNull: false
  },
  password:{
    type: Sequelize.STRING,
    allowNull: false
  },
  phone:{
    type: Sequelize.STRING,
  },
  birth:{
    type: Sequelize.DATE,
  },
  gender:{
    type: Sequelize.ENUM('F', 'M')
  },
  googleId: Sequelize.STRING,
},
{
  classMethods:{
    register: function(user){
      //console.log("db",user,  user.username, user.name, user.email, user.password);
      return User.create({
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password
      });
    },

    exit: function(user){
      console.log("db", user);
      return User.findOne({
        where:{
          username: user.username,
          password: user.password
        }
      });

    }
  }
});





module.exports = User;