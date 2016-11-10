var Sequelize = require('sequelize');
var Promise = require('bluebird');
var db = require('./_db');

var Location = db.define('location', {
  name:{
    type: Sequelize.STRING,
    allowNull: false
  }
},
{
  classMethods:{

  }
});





module.exports = Location;