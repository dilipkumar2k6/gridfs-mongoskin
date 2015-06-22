var mongoskin = require('mongoskin');
var configDB = require('./DBConfig.js');

// Connect DB
var db = mongoskin.db(configDB.url, {
    native_parser: true
});
console.log('Exporting database connection for given URL ' + configDB.url);
//Export DB connection object for further use
module.exports.db = db;

//Export  BSON data type
module.exports.BSON = mongoskin.BSONPure;
