var Router = require('koa-router')
var router = new Router()
var Record = require('../database/schema/record')
var Homework = require('../database/schema/homework')
var Student = require('../database/schema/student')


router.get('/', ctx => {
    ctx.body = 'welcome'
})

router.get('/help', ctx => {
    ctx.body = 'help'
})

router.get('/all', async (ctx) => {

    var records = await Record.find().then()
    ctx.body = JSON.stringify(records)
})

router.get('/last', async ctx => {
    var hashtable = {}

    var records = await Record.aggregate([
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

    ctx.body = JSON.stringify(records)
})


router.get('/rank', async ctx => {
    var hashtable = {}

    var records = await Record.aggregate([
        { $sort: { time: -1 } },
        {
            $group: {
                _id: { stu: "$student", cour: "$course", prob: "$problem" },
                content: { "$first": "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$content" } },
        { $project: { _id: 0 } },
        {
            $addFields: {
                result_timeout: { $in: [true, "$result.timeout"] },
                result_fail: { $in: [false, "$result.success"] }
            }
        },
        {
            $group: {
                _id: { stu: "$student", prob: "$problem" },
                problem: { $first: "$problem" },
                results: { $push: "$$ROOT" },
                timeout_count: { $sum: { $cond: ["$result_timeout", 1, 0] } },
                success_count: { $sum: { $cond: ["$success", 1, 0] } },
                fail_count: { $sum: { $cond: ["$result_fail", 1, 0] } },
            }
        }, {
            $project: {
                "results.problem": 0,
                "results.student": 0
            }
        }, {
            $sort: { problem: 1 }
        }, {
            $group: {
                _id: "$_id.stu",
                problems: { $push: "$$ROOT" },
                success_count: { $sum: { $cond: ["$success_count", 1, 0] } },
            }
        }, {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "id",
                as: "info"
            },
        }, {
            $addFields: {
                info: { $arrayElemAt: ["$info", 0] }
            }
        }, {
            $sort: { success_count: -1 }
        }
    ])
    ctx.body = JSON.stringify(records)
})
module.exports = router