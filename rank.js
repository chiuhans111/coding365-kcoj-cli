var bot = require('./bot/bot')
var studentsNames = require('./students')
const fs = require('fs')
const chalk = require('chalk')

module.exports = async function () {
    var students = {}
    var problemIds = []
    for (var course = 1; course <= 4; course++) {
        console.log(' checking course ' + course)
        await bot.login({ courseId: course })
        var homeworks = await bot.homework_all({ detail: true })
        for (var homework of homeworks) {
            if (!homework.nodata) {
                for (var student of homework.finished) {

                    if (students[student] == null) students[student] = {
                        score: 0,
                        score2: 0,
                        success: []
                    }
                    var homeworkid = course + '' + homework.id
                    students[student].success.push(homeworkid)
                    if (problemIds.indexOf(homeworkid) == -1)
                        problemIds.push(homeworkid)
                    students[student].score += 1
                    students[student].score2 += 1
                }
            }
        }
    }

    problemIds.sort()

    var result = []

    for (var i in students) {
        result.push({
            id: i,
            name: (studentsNames[i] || { name: '未知' }).name,
            score: students[i].score,
            score2: students[i].score2,
            success: students[i].success
        })
    }

    result.sort((a, b) => {
        return b.score2 - a.score2
    })

    var chalks = [
        [chalk.bgGreen.black, chalk.bgBlack.white, chalk.bgBlue, chalk.bgWhiteBright.black],
        [chalk.bgGreenBright.black, chalk.bgBlackBright.white, chalk.bgBlueBright, chalk.bgWhite.black]
    ]

    var coursechalk = [
        [
            console.log,
            chalk.bgYellow.black,
            chalk.bgMagenta.black,
            chalk.bgRed.black,
            chalk.bgCyan.black
        ],
        [
            console.log,
            chalk.bgYellowBright.black,
            chalk.bgMagentaBright.black,
            chalk.bgRedBright.black,
            chalk.bgCyanBright.black
        ]
    ]

    var header = ''
    for (i = 0; i < 4; i++) {
        header += '\n' + (''.padStart(9 + 2 + 4 + 2 + 4 + 2 + 3))
        problemIds.map((id, x) => {
            header += coursechalk[x % 2][id[0]]((id[i] != null) ? id[i] : ' ')
        })
    }

    console.log(header)
    result.map((line, i) => {
        var cha = chalks[i % 2]
        var chb = coursechalk[i % 2]

        var output = cha[3](' ' + line.id.padStart(9) + ' ')
        output += cha[2](' ' + line.name.padStart(4, '　') + ' ')
        output += cha[3](String(line.score).padStart(4) + ' ')

        problemIds.map((id) => {
            if (line.success.indexOf(id) != -1) output += chb[+id[0]]('+')
            else output += cha[1]('-')
        })

        console.log(output)
    })

    //fs.writeFileSync('./homeworks_score.json', JSON.stringify(result))
}