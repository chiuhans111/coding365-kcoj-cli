var Record = require('../../../database/schema/record')
var Homework = require('../../../database/schema/homework')
var Student = require('../../../database/schema/student')


exports.all = async function () {
    return await Record.find().sort('-time').then()
}

exports.last = async function () {
    return await Record.aggregate([
        { $sort: { time: -1 } },
        {
            $group: {
                _id: { stu: "$student", cour: "$course", prob: "$problem" },
                content: { "$first": "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$content" } },
        { $project: { _id: 0 } }
    ])
}

