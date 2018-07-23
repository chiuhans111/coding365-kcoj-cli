var mongoose = require('mongoose')

var schema = new mongoose.Schema({
    id: String,
    name: String,
    github: String
})

module.exports = mongoose.model('student', schema)