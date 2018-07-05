#!/usr/bin/env node

const bot = require('./bot/bot')
var program = require('commander')
var process = require('process')
var path = require('path')
program.version('0.8.7')
    .option('-w, --hw [id]', 'set homework id')
    .option('-r, --read', 'read homework content')
    .option('--result', 'see result')
    .option('-u, --user [username]', 'see other user')
    .option('-p, --push [filepath]', 'upload homework')
    .option('--desc [description]', 'add description')
    .option('-d, --del', 'delete homework')
    .parse(process.argv)


if (program.hw)
    bot.login().then(_ => {
        if (program.read)
            bot.homework_show(program.hw)
                .then(x => console.log(x))
        if (program.del)
            bot.homework_del(program.hw)
                .then(x => console.log(x))
        if (program.push)
            bot.homework_up(program.hw, path.resolve(program.push), program.desc)
                .then(x => console.log(x))
        if (program.result)
            bot.homework_result(program.hw, program.user)
                .then(x => console.log(x))

    })
else console.log('you need to specifie homework id, see --help')
/*
bot.login()
    .then(_ => console.log('login success'))
    .then(_ => bot.homework_show('034'))
    .then(x => console.log(x))
    .then(_ => bot.homework_del('034'))
    .then(_ => bot.homework_up('034', 'C:/Users/Hans/Documents/GitHub/coding365/python/34.py', 'yeeee'))

    */