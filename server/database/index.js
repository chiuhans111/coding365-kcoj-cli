
const mongoose = require('mongoose')


var dbconfig = require('./dbconfig')


var db = mongoose.connection
db.on('error', console.error.bind(console, 'mongo err:'))

module.exports.db = db
module.exports.connect = function () {
    mongoose.connect(dbconfig.url)
}