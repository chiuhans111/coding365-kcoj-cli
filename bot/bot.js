const request = require('request').defaults({ rejectUnauthorized: false })
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')
const chalk = require('chalk')
const RunResult = require('./format/RunResult')
const Homework = require('./format/Homework')
const process = require('process')

// require('request').debug = true



const config = require('./config/config').config



var cookie = null

var j = require('request').jar()

var logined = null
exports.login = function (name, passwd, rdoCourse) {
    var loginHash = JSON.stringify({ name, passwd, rdoCourse })
    if (name == null) name = config.private.user.name
    if (passwd == null) passwd = config.private.user.passwd
    if (rdoCourse == null) rdoCourse = config.public.courseId
    if (logined == loginHash) return new Promise(done => done())
    else {
        //console.log('logined as', name, rdoCourse)
        return new Promise((done, error) => request.post(config.public.Url.login, {
            form: { name, passwd, rdoCourse },
            jar: j
        }, done)).then(_ => new Promise((done, err) => request.get(config.public.Url.welcome, {
            jar: j
        }, function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            var content = document.body.textContent
            logined = loginHash
            if (content.match(name))
                done(j)
            else {
                console.log('please check your username and password.')
                done('login failed')
            }
        })))
    }
}


exports.homework_all = async function (hwType = null, detail = false, studentId, courseId) {
    if (studentId == null) studentId = config.private.user.name
    return new Promise(async function (done) {
        process.stdout.clearLine()
        process.stdout.write('  fetching homework list\r')
        request.get(config.public.Url.homework.board, {
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
                    uploaded: (mark.match('已繳') != null), studentId
                })

                if (detail) {
                    homework.runResult = await exports.homework_result(homework.id, studentId)
                    homework.finished = await exports.homework_success(homework.id)
                    homework.update()
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
        request.post(config.public.Url.homework.show, {
            qs: { hwId },
            jar: j
        }, function (err, res, body) {
            var content = ''
            body.replace(/^ <BR> ([^]*?)$/gm, function (str, line) {
                content += line.replace(/[\s\r\n]*$/, '') + '\n'
            })
            content = content.replace(/<br>[^]*$/, '')

            /*
            var document = (new jsdom.JSDOM(body)).window.document

            var content = [...document.body.childNodes]
                .filter(x => x.nodeType == x.TEXT_NODE)
                .map(x => x.nodeValue.trim()).join('\n')
                */
            done(content)
        })
        // }
    }).then(result => {
        // fs.writeFileSync(cachePath, result)
        return result
    })
}

exports.homework_del = async function (title) {
    return await new Promise(done => {
        request.post(config.public.Url.homework.del, {
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
    return await new Promise((done, error) => {
        request.get(config.public.Url.homework.upid, {
            qs: { hwId },
            jar: j,
        }, function () {
            var form = request.post(config.public.Url.homework.up, {
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
    if (studentID == null) studentID = config.private.user.name
    var output = null
    var refresh = false
    var retry = 0
    do {
        refresh = false
        output = new RunResult()
        await new Promise((done, error) => request.get(config.public.Url.homework.result, {
            qs: { questionID, studentID },
            jar: j
        }, function (err, res, body) {
            if (err) {
                console.log(err)
            }
            if (body == null) {
                done()
            }
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
    return await new Promise((done, error) => {
        request.get(config.public.Url.homework.success, {
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

