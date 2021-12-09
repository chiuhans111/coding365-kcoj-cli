var Record = require('../../../database/schema/record')

exports.rank = async function () {
    return await Record.aggregate([
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
}