const bot2 = require('./bot/v2')
const Router = require('koa-router')
var router = new Router()

var Homework = require('./server/database/schema/homework')
var Student = require('./server/database/schema/student')
var Record = require('./server/database/schema/record')



var mongoose = require('mongoose')

async function removeDuplicates() {
    var ids = await Record.aggregate([
        {
            $addFields: {
                state: {
                    $reduce: {
                        input: "$result.content",
                        initialValue: "",
                        in: { $concat: ["$$value", ",", "$$this"] }
                    }
                }
            }
        },
        {
            $sort: { time: -1 }
        },
        {
            $group: {
                _id: { a: '$student', b: '$problem', c: '$course', d: '$success', e: '$state' },
                content: { $push: "$_id" }
            }
        }
    ]).then()
    ids.map(async id => {
        var target = id.content.slice(1, -1).map(x => {
            return mongoose.Types.ObjectId(x)
        })
        await Record.remove({
            '_id': {
                $in: target
            }
        }).then()
    })
    console.log('removed duplicates')
}

async function updateHomeworkList(course) {
    var list = await bot2.homework_list()
    list.map(homework => {
        homework.course = course
        Homework.findOneAndUpdate({
            id: homework.id,
            course
        }, homework, { upsert: true }).catch(err => {
            console.log(err)
        })
    })
}


function GetHomeworkTask({ successList, homework, student, course, token, detail }) {
    return async function () {

        var networked = false
        let inSuccessList = successList.indexOf(student.id) != -1

        let result = []

        if (token.valid === false) {
            inSuccessList = false
        }
        else if (inSuccessList) {
            if (token.valid === null) {
                result = await bot2.homework_result(homework.id, student.id)
                networked = true
                if (result.length > 0) {
                    token.result = result
                    token.valid = true
                }
                else {
                    token.valid = false
                    inSuccessList = false
                }
            } else if (token.valid === true) {
                if (token.result != null) {
                    result = JSON.parse(JSON.stringify(token.result))
                } else {
                    result = await bot2.homework_result(homework.id, student.id)
                    networked = true
                    token.result = result
                }
            }
        } else {
            if (detail) {
                result = await bot2.homework_result(homework.id, student.id)
                networked = true
            }
            token.valid = true
        }


        var record = new Record({
            course,
            student: student.id,
            problem: homework.id,
            success: inSuccessList,
            time: new Date(),
            result
        })
        record.save()
        return networked

    }
}


async function completeGrap(course) {
    await bot2.login({ courseId: course })

    await updateHomeworkList(course)
    console.log('updated homework')
    var homeworks = await Homework.find({ course }).then()
    // homeworks = homeworks.slice(0, 10)
    console.log('homeworks found')
    var students = await Student.find().then()
    // students = students.slice(0, 10)

    var successLists = []
    var activeStudents = {}

    var count = 0
    var timeoutcounter = 0;

    console.log('start preload lists')
    await Promise.all(homeworks.map(homework => {
        return async function () {
            await new Promise(done => setTimeout(done, timeoutcounter += 20))
            var successList = await bot2.homework_success(homework.id)
            for (var student of successList) {
                if (activeStudents[student] == null)
                    activeStudents[student] = 0
                activeStudents[student]++
            }
            successLists[homework.id] = successList
            count++
            process.stdout.write('  preparing:' + count + '\r    ')
        }
    }).map(x => x()))




    var mostActiveStudent = []
    for (var i in activeStudents) {
        mostActiveStudent.push({
            student: i,
            score: activeStudents[i]
        })
    }

    mostActiveStudent.sort((a, b) => b.score - a.score)

    mostActiveStudent = mostActiveStudent.filter(x => {
        return x.score > mostActiveStudent[mostActiveStudent.length - 1].score
    })

    var mostActive10 = {}
    mostActiveStudent.slice(0, 10).map(x => mostActive10[x.student] = x.score)
    console.log('most active:')
    console.log(mostActive10)

    for (let homework of homeworks) {
        var tasks = []

        let token = {
            valid: null
        }

        console.log('prepare homework:', homework.id)
        let successList = successLists[homework.id]

        for (let student of students) {
            tasks.push(GetHomeworkTask({
                successList,
                homework,
                student,
                course,
                token,
                detail: mostActive10[student.id] != null
            }))
        }

        console.log(tasks.length)
        while (tasks.length > 0) {

            process.stdout.write("  remainning task:" + tasks.length + "     \r")
            working = []
            var networked = 0
            tasks = tasks.filter(t => {
                if (working.length >= 4) return true
                working.push(t)
                return false
            })
            await Promise.all(working.map(x => async function () {
                if (await x()) networked++
            }).map(x => x()))
            if (networked > 0)
                await new Promise(done => setTimeout(done, networked * 100))
        }
    }

    console.log('done                        ')
}


router.get('/util/grap', async ctx => {
    var value = await exports.graps()
    ctx.body = value
})

exports.router = router

var graping = false
exports.graps = async function () {
    if (graping) return 'allready graping'
    graping = true
    //await removeDuplicates();

    console.log("graping 1")
    await completeGrap(1)
    console.log("graping 2")
    await completeGrap(2)
    console.log("graping 3")
    await completeGrap(3)
    console.log("graping 4")
    await completeGrap(4)

    await removeDuplicates();
    graping = false
    return 'done'
}
