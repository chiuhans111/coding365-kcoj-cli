var Record = require('../schema/record')
var mongoose = require('mongoose')

exports.findStrangeIdsDanger = async function () {
    var ids = await Record.aggregate([{
        $sort: { time: -1 }
    }, {
        $group: {
            _id: { a: "$student", b: "$problem", c: "$course" },
            "content": {
                $push: {
                    time: "$time",
                    id: "$_id",
                    success: "$success",
                    result: "$result"
                }
            }
        }
    }, {
        $addFields: {
            final: { $arrayElemAt: ["$content.success", 0] }
        }
    }, {
        $unwind: { path: "$content" }
    }, {
        $addFields: {
            id: "$content.id", correct: {
                $or: [
                    { $eq: ["$final", "$content.success"] },
                    "$success"]
            }, course: "$_id.c",
            problem: "$_id.b"
        }
    }, {
        $match:
            { correct: false, final: false }
    }, {
        $project: { id: 1, _id: 0 }
    }]).then()

    // await Record.remove({
    //     '_id': {
    //         $in: ids.map(x => mongoose.Types.ObjectId(x.id))
    //     }
    // }).then()

    return ids.map(x => x.id)
}


