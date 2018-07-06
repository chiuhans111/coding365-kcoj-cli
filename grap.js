const bot = require('./bot/bot')



async function main() {
    await bot.login()
    for (var i = 1; i < 40; i++) {
        var content = await bot.homework_show(String(i).padStart(3, '0'))
    }
}

main()
