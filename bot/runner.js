const child_process = require('child_process')
const chalk = require('chalk')
const RunResult = require('./format/RunResult')
module.exports = async function (programPath, problemParsed) {
    var result = await Promise.all(problemParsed.tests.map(async function (test) {
        return await new Promise(done => {

            var py = child_process.spawn('python', [programPath])

            py.stdin.write(test.input)

            var timeout = setTimeout(() => {
                py.kill()
                done({
                    timeout: true,
                    answer: test.output
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

    var runResult = new RunResult()
    result.map((x, i) => {
        runResult.addResult({
            id: i,
            input: x.input,
            output: x.output,
            error: x.error.length > 0 ? x.error : null,
            timeout: x.timeout ? '>8s' : null,
            answer: x.answer,
            correct: x.correct
        })
    })

    return runResult
}