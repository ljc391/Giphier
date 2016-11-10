var Sequelize = require('sequelize');

var db = new Sequelize('postgres://localhost:5432/giphier', {
  logging: false
});

// var db = new Sequelize('lienjung_onion','lienjung_elaine','22300986' {
//   logging: false
// });



module.exports = db;