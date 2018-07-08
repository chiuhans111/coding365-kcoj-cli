const chalk = require('chalk')
const config2 = require('../config/private')

function Homework(content) {
    /**@type {Homework} */
    var me = this
    this.no = 0
    this.type = ''
    this.id = ''
    this.time = new Date()
    this.language = ''
    this.uploaded = false
    this.runResult = null
    this.finished = null
    this.studentId = ''

    Object.assign(this, content)

    this.toString = function () {
        var output = ' '//  + String(me.no).padStart(3) + ' '
        // output += ' ' + me.type.padStart(4) + ''
        output += chalk.bgBlue(' > ' + me.id + ' ')

        var timestr = chalk.red.bgBlack('expired')
        var now = new Date()
        if (me.time - now > 0) timestr = timeformat(me.time, now)

        output += timestr

        var nodata = false



        if (me.runResult && me.finished) {



            if (me.finished.indexOf(me.studentId) != -1) {
                if (!me.runResult.pass()) {
                    if (me.studentId == config2.user.name && me.uploaded)
                        output += chalk.bgGreen.black(' ') + chalk.red('no data. ')
                    else
                        output += chalk.red(' no data. ')

                    nodata = true
                }
                else if (me.studentId == config2.user.name && !me.uploaded) {
                    output += chalk.red(' no data. ')
                    nodata = true
                }
                else {
                    output += chalk.black.bgGreen('    ok    ')
                }
            } else {
                if (!me.uploaded && me.studentId == config2.user.name)
                    output += chalk.red('    --    ')
                else output += me.runResult.toString(null, true)
            }
            if (!nodata) {
                var passedStr = ' ' + String(me.finished.length).padStart(3) + ' pass     '
                var passedBar = ''
                for (var i = 0; i < passedStr.length; i++)
                    if (i < me.finished.length / 2)
                        passedBar += chalk.bgBlue(passedStr[i])
                    else
                        passedBar += chalk.bgBlack(passedStr[i])
                output += passedBar
            }

        } else {
            if (me.uploaded) output += chalk.black.bgGreen(' ok ')
            else output += chalk.bgBlack(' -- ')
            if (me.runResult) output += me.runResult.toString(null, true)
            if (me.finished) output += me.finished.length
        }

        return output
    }
}

/**@param {Date} timeA
 * @param {Date} timeB
 */
// 10 character
function timeformat(timeA, timeB) {
    var time = timeA - timeB

    var year = timeA.getFullYear() - timeB.getFullYear()
    var month = timeA.getMonth() - timeB.getMonth()
    if (month < 0) year -= 1
    if (year > 0) return chalk.black.bgWhite(' ' + (year + ' year').padStart(8) + ' ')
    var data = []
    for (var size of [1000, 60, 60, 24, 1]) {
        data.push(time % size)
        time /= size
    }
    var tags = ['ms', 'sec', 'min', 'hour', 'day']
    var chalks = [
        chalk.white.bgRed,
        chalk.white.bgRed,
        chalk.black.bgYellow,
        chalk.black.bgYellow,
        chalk.black.bgGreen
    ]
    for (var i = 4; i >= 0; i--) {
        if (data[i] > 0) return chalks[i](' ' + (data[i] + ' ' + tags[i]).padStart(8) + ' ')
    }
}

module.exports = Homework