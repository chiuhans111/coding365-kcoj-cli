const request = require('request').defaults({ rejectUnauthorized: false })
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')
const chalk = require('chalk')
const RunResult = require('./format/RunResult')
const Homework = require('./format/Homework')
const process = require('process')

// require('request').debug = true


const config1 = require('./config/public')
const config2 = require('./config/private')

var cookie = null


var logined = false
var j = require('request').jar()
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


exports.homework_all = async function (hwType = null, detail = false, studentId) {
    if (studentId == null) studentId = config2.user.name
    return new Promise(async function (done) {
        await exports.login()
        process.stdout.clearLine()
        process.stdout.write('  fetching homework list\r')
        request.get(config1.Url.homework.board, {
            qs: hwType ? { hwType } : {},
            jar: j
        }, async function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            var lines = [...document.querySelectorAll('tr')].slice(1)
            var count = 0
            var content = await Promise.all(lines.map(async function (line, id, arr) {
                var [no, type, id, time, _, language, mark] = [...line.querySelectorAll('td')].map(x => x.textContent)
                var homework = new Homework({
                    no: Number(no), type, id: id.trim(), time: new Date(time), language,
                    uploaded: mark.match('已繳'), studentId
                })

                if (detail) {
                    homework.runResult = await exports.homework_result(homework.id, studentId)
                    homework.finished = await exports.homework_success(homework.id)
                }
                process.stdout.write('  processed:' + count + '/' + arr.length + '     \r')
                count++
                return homework
            }))
            process.stdout.clearLine()

            done(content)
        })

    })
}

exports.homework_show = async function (hwId) {

    var cachePath = path.resolve(__dirname, './cache/' + hwId + '.txt')
    return new Promise(async function (done, error) {

        // if (fs.existsSync(cachePath)) done(fs.readFileSync(cachePath).toString())
        // else {
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
        // }
    }).then(result => {
        // fs.writeFileSync(cachePath, result)
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
    if (auto) process.stdout.write('  please wait...\r')
    if (studentID == null) studentID = config2.user.name
    await exports.login()
    var output = null
    var refresh = false
    var retry = 0
    do {
        refresh = false
        output = new RunResult()
        await new Promise((done, error) => request.get(config1.Url.homework.result, {
            qs: { questionID, studentID },
            jar: j
        }, function (err, res, body) {

            if (body.match('未經過任何測試')) done()

            var document = (new jsdom.JSDOM(body)).window.document
            // console.log(body)
            var content = [...document.querySelectorAll('tr')].slice(1)
                .map(x => {
                    // console.log(x.textContent)
                    var result = x.textContent.trim().replace(/[\n\t]+/g, '\t').split('\t')

                    output.addResult({
                        id: result[0],
                        timeout: result[1].match('超過時間') ? '>' + result[1].match(/(\d+)秒/)[1] + 's' : null,
                        correct: result[1].match('通過')
                    })
                })


            done()
        }))



        if (output.tests.length == 0) retry = 2

        if (auto && retry > 0) {
            refresh = true
            var success = await exports.homework_success(questionID)
            if (success.indexOf(studentID) != -1) {
                refresh = false
            }
            else await new Promise(pass => setTimeout(pass, 1000))
            retry--
        }

    } while (refresh)
    process.stdout.clearLine()
    return output
}


exports.homework_success = async function (HW_ID) {
    await exports.login()
    return await new Promise((done, error) => {
        request.get(config1.Url.homework.success, {
            qs: { HW_ID },
            jar: j
        }, function (err, res, body) {
            // console.log('body', body)
            var document = (new jsdom.JSDOM(body)).window.document
            var result = [...document.querySelectorAll('tr')].slice(1)
                .map(x => x.textContent.trim())
            done(result)
        })
    })
}

