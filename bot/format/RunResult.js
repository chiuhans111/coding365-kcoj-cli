const chalk = require('chalk')

module.exports = function () {
    var me = this
    this.tests = []
    /**@param {{id:String, input?:String, output?:String, error?:String, timeout?:String, correct:Boolean, answer?:String}} obj*/
    this.addResult = function (obj) {
        me.tests.push(obj)
    }
    this.toString = function (detail, onlyProgress = false) {
        var correctCount = 0

        if (me.tests.length == 0) return chalk.red.bgBlack(' no data. ')

        var content = me.tests.map((x, i) => {
            var output = chalk.black.bgWhite(' test ' + (i + 1) + ' ')
            if (x.timeout) output += chalk.blue.bgBlack(' TLE (' + x.timeout + ') ')
            else if (x.error) output += chalk.yellow.bgBlack(' ERR ')
            else if (x.correct) {
                output += chalk.black.bgGreen(' AC ')
                correctCount++
            }
            else output += chalk.red.bgBlack(' WA ')

            if (detail) {
                if (x.error)
                    output += '\nyour output:\n' + x.error + '\n'
                if (x.answer)
                    output += '\ncorrect answer:\n' + x.answer + '\n'
                if (x.output)
                    output += '\nyour output:\n' + x.output + '\n'
            }
            return output
        }).join('\n')

        if (onlyProgress) {




            var correctPercent = correctCount / me.tests.length
            var progressStr = '   ' +
                String(Math.floor(correctPercent * 100)).padStart(3) + '%   '
            var progressBar = ''
            for (var i in progressStr) {
                if (i / progressStr.length < correctPercent)
                    progressBar += chalk.black.bgGreen(progressStr[i])
                else
                    progressBar += chalk.white.bgRed(progressStr[i])
            }

            return progressBar
        }


        return content
    }
}