var Record = require('../../../database/schema/record')


exports.queryFilter = function ({
    dateStart = null,
    dateEnd = null,
    course = null,
    student = null,
    problem = null,
    detail = null
}) {
    
    let filters = []


    if (course != null) filters.push({ $match: { course: Number(course) } })
    if (student != null) filters.push({ $match: { student } })
    if (problem != null) filters.push({ $match: { problem } })

    let timeLimitFields = {}

    filters.push({
        $sort: { time: 1 }
    })

    if (dateStart != null) {
        timeLimitFields.left = {
            $arrayElemAt: [{
                $filter: {
                    input: "$content.time",
                    cond: { $lte: ["$$this", new Date(dateStart)] }
                }
            }, -1]
        }
    }

    if (dateEnd != null) {
        timeLimitFields.right = {
            $arrayElemAt: [{
                $filter: {
                    input: "$content.time",
                    cond: { $gte: ["$$this", new Date(dateEnd)] }
                }
            }, 0]
        }
    }


    if (dateStart != null || dateEnd != null) filters.push(...[
        {
            $group: {
                _id: { a: "$student", b: "$problem", c: "$course" },
                content: { $push: "$$ROOT" }
            }
        }, {
            $addFields: timeLimitFields
        }, {
            $unwind: { path: "$content" }
        }, {
            $addFields: {
                ok: {
                    $and: [
                        {
                            $or: [
                                { $not: { $gt: ["$left", 0] } },
                                { $gte: ["$content.time", "$left"] }
                            ]
                        },
                        {
                            $or: [
                                { $not: { $gt: ["$right", 0] } },
                                { $lte: ["$content.time", "$right"] }
                            ]
                        }
                    ]
                }
            }
        }, {
            $match: { ok: true }
        }, {
            $replaceRoot: { newRoot: "$content" }
        }, {
            $sort: { time: 1 }
        }
    ])


    if (detail !== 'true') {
        filters.push({
            $project: {
                _id: 0,
                result: 0
            }
        })
    }

    return filters
}


exports.query = async function (queryObject) {
    return await Record.aggregate(exports.queryFilter(queryObject))
}