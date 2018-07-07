const request = require('request').defaults({ rejectUnauthorized: false })
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')
const chalk = require('chalk')

// require('request').debug = true
var j = require('request').jar()


const config1 = require('./config/public')
const config2 = require('./config/private')

var cookie = null

var logined = false

exports.login = function (name, passwd, rdoCourse) {
    if (name == null) name = config2.user.name
    if (passwd == null) passwd = config2.user.passwd
    if (rdoCourse == null) rdoCourse = config2.courseId
    if (logined) return new Promise(done => done())
    else
        return new Promise((done, error) => request.post(config1.Url.login, {
            form: { name, passwd, rdoCourse },
            jar: j
        }, done)).then(_ => new Promise((done, err) => request.get(config1.Url.welcome, {
            jar: j
        }, function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            var content = document.body.textContent
            logined = true
            done(content)
        })))
}

exports.homework_show = async function (hwId) {

    var cachePath = path.resolve(__dirname, './cache/' + hwId + '.txt')
    return new Promise(async function (done, error) {

        if (fs.existsSync(cachePath)) done(fs.readFileSync(cachePath).toString())
        else {
            await exports.login()
            request.post(config1.Url.homework.show, {
                qs: { hwId },
                jar: j
            }, function (err, res, body) {
                var document = (new jsdom.JSDOM(body)).window.document
                var content = [...document.body.childNodes]
                    .filter(x => x.nodeType == x.TEXT_NODE)
                    .map(x => x.nodeValue.trim())
                done(content.join('\n'))
            })
        }
    }).then(result => {
        fs.writeFileSync(cachePath, result)
        return result
    })
}

exports.homework_del = async function (title) {
    await exports.login()
    return await new Promise(done => {
        request.post(config1.Url.homework.del, {
            qs: { title },
            jar: j
        }, function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            var content = document.body.textContent
            done(content)
        })
    })
}

exports.homework_up = async function (hwId, filepath, desc = '') {

    await exports.login()
    return await new Promise((done, error) => {
        request.get(config1.Url.homework.upid, {
            qs: { hwId },
            jar: j,
        }, function () {
            var form = request.post(config1.Url.homework.up, {
                jar: j
            }, function (err, res, body) {
                var document = (new jsdom.JSDOM(body)).window.document
                var content = document.body.textContent
                done(content)
            }).form()
            form.append('hwFile', fs.createReadStream(filepath), {
                contentType: 'text/plain'
            })
            form.append('FileDesc', desc)
        })
    })
}


exports.homework_result = async function (questionID, studentID, auto) {
    if (auto) console.log('please wait...')
    if (studentID == null) studentID = config2.user.name
    await exports.login()
    var output = ''
    var refresh = false
    var retry = 0
    do {
        refresh = false
        output = await new Promise((done, error) => request.get(config1.Url.homework.result, {
            qs: { questionID, studentID },
            jar: j
        }, function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            // console.log(body)
            var content = [...document.querySelectorAll('tr')].slice(1)
                .map(x => {
                    var result = x.textContent.trim().replace(/[\n\t]+/g, '\t').split('\t')
                    var output = chalk.black.bgWhite(' ' + result[0] + ' ')

                    if (result[1].match('超過時間')) output += chalk.blue.bgBlack(' TLE (>' + result[1].match(/(\d+)秒/)[1] + 's) ')
                    else if (result[1].match('失敗')) output += chalk.red.bgBlack(' WA ')
                    else output += chalk.black.bgGreen(' AC ')

                    return output
                })
                .join('\n') + '\n progress:\t' + document.querySelector('.progress,.alert').textContent.trim()
            done(content)
        }))

        if (output.match('未經過任何測試')) retry = 2

        if (auto && retry > 0) {
            refresh = true
            await new Promise(pass => setTimeout(pass, 1000))
            retry--
        }

    } while (refresh)
    return output
}