const child_process = require('child_process')
const chalk = require('chalk')
module.exports = async function (programPath, problemParsed, detail) {
    var result = await Promise.all(problemParsed.tests.map(async function (test) {
        return await new Promise(done => {

            var py = child_process.spawn('python', [programPath])

            py.stdin.write(test.input)

            var timeout = setTimeout(() => {
                py.kill()
                done({
                    timeout: true
                })
            }, 8000);

            var output = ''
            var error = ''

            py.stderr.on('data', data => {
                error += data
                // console.error(data.toString())
            })

            py.stdout.on('data', data => {
                output += data
                // console.log(data.toString())
            })



            py.on('close', _ => {
                output = output.replace(/\r/g, '')
                var correct = output.trim() == test.output.trim()
                done({
                    input: test.input,
                    output,
                    error,
                    answer: test.output,
                    correct
                })
                clearTimeout(timeout)
            })
        })
    }))


    result.map((x, i) => {
        var output = chalk.black.bgWhite(' test ' + (i + 1) + ' ')
        if (x.timeout) output += chalk.blue.bgBlack(' TLE (>8s) ')
        else if (x.error.length > 0) output += chalk.yellow.bgBlack(' ERR ')
        else if (x.correct) output += chalk.black.bgGreen(' AC ')
        else output += chalk.red.bgBlack(' WA ')
        console.log(output)
        if (detail) {
            console.log("correct answer:")
            console.log(x.answer)
            console.log("your output:")
            console.log(x.output)
        }
    })


}