#!/usr/bin/env node

const bot = require('./bot/bot')
var program = require('commander')
var process = require('process')
var command = require('./command')
var runner = require('./bot/runner')
var parser = require('./bot/parser')


var path = require('path')
program.version('0.8.7')
    .option('-w, --hw [id]', 'set homework id')
    .option('-r, --read', 'read homework content')
    .option('--result', 'see result')
    .option('-u, --user [username]', 'see other user')
    .option('-p, --push [filepath]', 'upload homework')
    .option('--desc [description]', 'add description')
    .option('-d, --del', 'delete homework')
    .option('-t, --test [filepath]', 'test homework')
    .parse(process.argv)

async function main() {

    if (program.hw) {
        if (program.read)
            console.log(await bot.homework_show(program.hw))
        if (program.test)
            runner(path.resolve(program.test), parser(program.hw, await bot.homework_show(program.hw)))
        if (program.del)
            console.log(await bot.homework_del(program.hw))
        if (program.push)
            console.log(await bot.homework_up(program.hw, path.resolve(program.push), program.desc))
        if (program.result)
            console.log(await bot.homework_result(program.hw, program.user))

    }
    else command();
}
main();
/*
bot.login()
    .then(_ => console.log('login success'))
    .then(_ => bot.homework_show('034'))
    .then(x => console.log(x))
    .then(_ => bot.homework_del('034'))
    .then(_ => bot.homework_up('034', 'C:/Users/Hans/Documents/GitHub/coding365/python/34.py', 'yeeee'))
    */



