#!/usr/bin/env node

const bot = require('./bot/bot')
var program = require('commander')
var process = require('process')
var command = require('./command')
var runner = require('./bot/runner')
var parser = require('./bot/parser')
var fs = require('fs')
var path = require('path')

var cachePath = path.resolve(__dirname, './bot/cache')
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath)

program.version('0.8.7')
    .name('kcoj')
    .option('')
    .option('-w, --hw [id]', 'set homework id')
    .option('-i, --file [filename]', 'main file')
    .option('')
    .option('-r, --read', 'read homework content')
    .option('')
    .option('-o  --result', 'see result')
    .option('-a  --auto', 'auto reload')
    .option('    --user [username]', 'see other user')
    .option('')
    .option('-p, --push', 'upload homework')
    .option('    --desc [description]', 'add description')
    .option('-d, --del', 'delete homework')
    .option('')
    .option('-t, --test', 'test homework')
    .option('    --detail', 'see detail')
    .option('')
    .option('init [hwid]', 'create a python file to start coding')
    .parse(process.argv)

function findHWID(str) {
    if (str == null) return null
    str = path.resolve(str)
    if (fs.existsSync(str)) {
        // console.log(str)
        var content = fs.readFileSync(str).toString()
        // console.log(content)
        var match = content.match(/^#\s*HWID:\s*(.+)\s*$/m)
        // console.log(match)
        if (match) return match[1]
        else return path.basename(str).match(/\d+/)[0].padStart(3, '0')
    }
    return null
}

async function main() {
    if (program.file) program.file = program.file

    if (program.hw == null) {
        program.hw = findHWID(program.file)
        if (program.init) program.hw = program.init
    }

    if (program.hw) {
        if (program.read)
            console.log(await bot.homework_show(program.hw))
        if (program.test) {
            var parsed = parser.fromFile(program.file)
            if (parsed.tests.length == 0) {
                console.log('no test found in file, downloading online tests...')
                var homework = await bot.homework_show(program.hw)
                parsed = parser.fromProblem(program.hw, homework)
            }
            runner(program.file, parsed, program.detail)
        }
        if (program.del)
            console.log(await bot.homework_del(program.hw))
        if (program.push) {
            console.log('pushing', program.hw, program.file)
            console.log(await bot.homework_up(program.hw, program.file, program.desc))
        }
        if (program.result)
            console.log(await bot.homework_result(program.hw, program.user, program.auto))
        if (program.init) {
            var homework = await bot.homework_show(program.hw)
            var parsed = parser.fromProblem(program.hw, homework)
            content = `HWID: ${parsed.id}\n${parsed.desc.trim()}\n\n`.split('\n')
                .map(x => x.trim().length > 0 ? '# ' + x : '').join('\r\n')
                + "'''" + parsed.tests.map((test, i) => {
                    return `\ninput:\n${test.input}\noutput:\n${test.output}\n`
                }).join('\n') + "'''"
            var file = content
            var filename = path.resolve(program.hw + '.py')
            if (fs.existsSync(filename)) console.log('file already exists')
            else fs.writeFileSync(filename, file)
        }

    }
    //else command();
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



