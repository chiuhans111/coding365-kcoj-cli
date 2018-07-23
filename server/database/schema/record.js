var mongoose = require('mongoose')

var schema = new mongoose.Schema({
    course: Number,
    student: String,
    problem: String,
    success: Boolean,
    result: [
        {
            id: String,
            content: String,
            success: Boolean,
            timeout: Boolean
        }
    ],
    time: Date
})

module.exports = mongoose.model('record', schema)