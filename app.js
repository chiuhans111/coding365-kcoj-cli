#!/usr/bin/env node

const bot = require('./bot/bot')
var program = require('commander')
var process = require('process')
var command = require('./command')
var runner = require('./bot/runner')
var parser = require('./bot/parser')
var fs = require('fs')
var chalk = require('chalk')
var path = require('path')

// var cachePath = path.resolve(__dirname, './bot/cache')
// if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath)

program.version('0.8.7')
    .name('kcoj')
    .option('')
    .option('-l, --list', 'list all homework')
    .option('')
    .option('-w, --hw [id]', 'set homework id')
    .option('-i, --file [filename]', 'main file')
    .option('')
    .option('-r, --read', 'read homework content')
    .option('')
    .option('-o  --result', 'see result')
    .option('-a  --auto', 'auto reload')
    .option('    --user [username]', 'see other user')
    .option('    --success', 'see who success')
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

async function main(forceResetHw = false, prefix = '') {

    if (program.list) {
        var all = await bot.homework_all(undefined, program.detail, program.user)
        for (var i of all) console.log(i.toString())
        return
    }


    if (program.file == null && program.hw == null && program.init == null) {
        var folder = path.resolve('./')
        var files = fs.readdirSync(folder)
            .filter(x => path.extname(x) == '.py')
            .map(x => path.resolve(x))
        for (var file of files) {
            program.file = file
            var result = await main(true, chalk.bgBlue(' > ' + path.basename(file) + ' '))
        }
        console.log('done processing ' + files.length + ' files')
        return
    }


    if (program.hw == null || forceResetHw) {
        program.hw = findHWID(program.file)
        if (program.init) program.hw = program.init
    }

    if (program.hw) {
        if (program.read)
            console.log(await bot.homework_show(program.hw))
        if (program.test) {
            var parsed = parser.fromFile(program.file)
            if (parsed.tests.length == 0) {

                process.stdout.write('  download online data...\r')
                var homework = await bot.homework_show(program.hw)
                process.stdout.clearLine();

                parsed = parser.fromProblem(program.hw, homework)
            }
            var result = await runner(program.file, parsed)
            console.log(prefix + result.toString(program.detail, prefix != ''))
        }

        if (program.del)
            console.log(await bot.homework_del(program.hw))

        if (program.push) {
            console.log('pushing', program.hw, program.file)
            console.log(await bot.homework_up(program.hw, program.file, program.desc))
        }

        if (program.result)
            console.log(prefix + (await bot.homework_result(
                program.hw, program.user, program.auto)).toString(false, prefix != ''))

        if (program.success)
            console.log(await bot.homework_success(program.hw))

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

    return true
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



