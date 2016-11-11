var Sequelize = require('sequelize');
var Promise = require('bluebird');
var db = require('./_db');

var Message = db.define('message', {
  content:{
    type: Sequelize.STRING,
    allowNull: false
  },
  date:{
    type:Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  isRead:{
    type:Sequelize.BOOLEAN
  }
},
{
  classMethods:{
    ReceiveMsg:function(id){
        return Message.findAll({include:[{model:User, as: 'from'},{model:User, as: 'to', where:{id:id}}]});
    },
    SendMsg:function(id){
        return Message.findAll({include:[{model:User, as: 'from', where:{id:id}},{model:User, as: 'to'}]});
    }
  }
});





module.exports = Message;