var db = require("./_db");
var User = require('./user');
var Location = require('./location');
var Message = require('./message');

// var Place = require('./place');
// var Hotel = require('./hotel');
// var Restaurant = require('./restaurant');
// var Activity = require('./activity');
// var Day = require('./day');

// Hotel.belongsTo(Place);
// Restaurant.belongsTo(Place);
// Activity.belongsTo(Place);

// Day.belongsTo(Hotel);
// Day.belongsToMany(Restaurant, {through: 'day_restaurant'});
// Day.belongsToMany(Activity, {through: 'day_activity'});
Message.belongsTo(User, { as: 'to' });
Message.belongsTo(User, { as: 'from' });

module.exports = db;
