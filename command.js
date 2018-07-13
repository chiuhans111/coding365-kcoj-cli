const read_old = require('read')
const process = require('process')
const bot = require('./bot/bot')
function read(option = {}) {
    return new Promise(done => read_old(option,
        function (err, res, isDefaule) {
            if (err) process.exit(0)
            done(res)
        }))
}


module.exports = async function () {
    var username = await read({
        prompt: "username:"
    })
    var password = await read({
        prompt: "password:",
        silent: true,
        replace: "*"
    })

    console.log(await bot.login({ name: username, passwd: password }))
    while (1) {
        var homework = await read({
            prompt: "homework:",
        }).padStart(3, '0')
        console.log(await bot.homework_show(homework))
    }
}