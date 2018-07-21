const chalk = require('chalk')

module.exports = function (length, size, part,
    c1 = 'black', b1 = 'bgGreen',
    c2 = 'white', b2 = 'bgRed') {
    var halfLength = Math.round(length / 2)

    var rate = part / size

    var progressStr =
        (Math.floor(rate * 100) + "%")
            .padStart(halfLength+1)
            .padEnd(length)

    var progressBar = ''
    for (var i in progressStr) {
        if (i / progressStr.length < rate)
            progressBar += chalk[c1][b1](progressStr[i])
        else
            progressBar += chalk[c2][b2](progressStr[i])
    }

    return progressBar
}