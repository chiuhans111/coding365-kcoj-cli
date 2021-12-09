
var Record = require('../../../database/schema/record')
var query = require('./query')

exports.formated = async function (queryObj) {
    var filter = query.queryFilter(queryObj)
    filter.push({
        $group: {
            _id: "$student",
            content: { $push: "$$ROOT" }
        }
    })

    filter.push({

        $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "id",
            as: "info"
        }

    })

    filter.push({
        $project: {
            "content.student": 0
        }
    })

    filter.push({
        $unwind: {
            path: "$info"
        }
    })

    /**@type {Date} */
    var dateStart = null
    var dateEnd = null
    if (queryObj.dateStart) dateStart = new Date(queryObj.dateStart)
    if (queryObj.dateEnd) dateEnd = new Date(queryObj.dateEnd)




    var results = await Record.aggregate(filter)
    results.map(result => {

        var sliceLeft = 0
        var sliceRight = result.content.length

        var pcheck = {}
        var count = 0   // sees all course same problem
        var countAll = 0    // sees different course different problem
        result.content.map((record, index) => {
            // group by problem
            var pid = record.problem
            var important = false
            var time = new Date(record.time)
            if (dateStart && time < dateStart) {
                record.time = dateStart.toISOString()
                sliceLeft = index
            }

            if (record.success) {
                if (pcheck[pid] == null)
                    pcheck[pid] = []

                if (pcheck[pid].length == 0)
                    count++

                if (!pcheck[pid].some(x => x == record.course)) {
                    pcheck[pid].push(record.course)
                    important = true
                    countAll++
                }

            } else if (pcheck[pid] != null) {

                // find if previous done that course, remove it
                pcheck[pid] = pcheck[pid].filter(x => {
                    if (x == record.course) {
                        countAll--
                        important = true
                        return false
                    }
                    return true
                })

                // none of the course have done
                if (pcheck[pid].length == 0) {
                    pcheck[pid] = null
                    count--

                }
            }

            record.count = count
            record.countAll = countAll
            record.important = important
        })

        result.content.splice(0, sliceLeft)

    })

    return results
}