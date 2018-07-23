var mongoose = require('mongoose')

var schema = new mongoose.Schema({
    no: Number,
    type: String,
    id: String,
    time: Date,
    language: String,
    course: Number
})

module.exports = mongoose.model('homework', schema)