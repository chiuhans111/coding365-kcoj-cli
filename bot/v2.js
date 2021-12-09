const request = require('request').defaults({ rejectUnauthorized: false })
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')


const RunResult = require('./format/RunResult')
const Homework = require('./format/Homework')
const config = require('./config/config').config
// require('request').debug = true

var j = require('request').jar()

var logined = null

exports.login = function ({
    name = config.private.user.name,
    passwd = config.private.user.passwd,
    courseId = config.public.courseId }) {

    var loginHash = JSON.stringify({ name, passwd, courseId })
    console.log('\n login as', name, courseId)
    if (logined == loginHash) return new Promise(done => done())
    else {
        return new Promise((done, error) => request.post(config.public.Url.login, {
            form: { name, passwd, rdoCourse: courseId },
            jar: j
        }, done)).then(_ => new Promise((done, error) => request.get(config.public.Url.welcome, {
            jar: j
        }, function (err, res, body) {
            if (err) error(err)

            var document = (new jsdom.JSDOM(body)).window.document
            var content = document.body.textContent
            logined = loginHash
            if (content.match(name))
                done(j)
            else {
                error('login failed')
            }
        })))
    }
}


exports.homework_list = async function () {
    return new Promise(async function (done) {

        request.get(config.public.Url.homework.board, {
            jar: j
        }, async function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            var lines = [...document.querySelectorAll('tr')].slice(1)

            var homeworks = lines.map((line, id, arr) => {
                var [no, type, id, time, _, language, mark] = [...line.querySelectorAll('td')].map(x => x.textContent)
                var homework = {
                    no: Number(no),
                    type,
                    id: id.trim(),
                    time: new Date(time),
                    language
                }
                return homework
            })

            done(homeworks)
        })

    })
}


exports.homework_show = async function (hwId) {

    return new Promise(async function (done, error) {
        request.post(config.public.Url.homework.show, {
            qs: { hwId },
            jar: j
        }, function (err, res, body) {
            if (err) error(err)
            var content = ''
            body.replace(/^ <BR>\s*([^]*?)$/gm, function (str, line) {
                content += line.replace(/[\s\r\n]*$/, '') + '\n'
            })
            content = content.replace(/<br>[^]*$/, '')
            done(content)
        })
    })
}

exports.homework_del = async function (hwId) {
    return await new Promise(done => {
        request.post(config.public.Url.homework.del, {
            qs: { title: hwId },
            jar: j
        }, function (err, res, body) {
            var document = (new jsdom.JSDOM(body)).window.document
            var content = document.body.textContent
            done(content)
        })
    })
}

exports.homework_up = async function ({ hwId, filepath, desc = '' }) {
    console.log('filepath', filepath)
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


exports.homework_result = async function (questionID, studentID) {
    if (studentID == null) studentID = config.private.user.name


    var output = []
    await new Promise((done, error) => request.get(config.public.Url.homework.result, {
        qs: { questionID, studentID },
        jar: j
    }, function (err, res, body) {
        if (err) error(err)

        if (body == null) {
            done()
        }
        try {

            if (body.match('未經過任何測試')) done()
            var document = (new jsdom.JSDOM(body)).window.document
            // console.log(body)
            var content = [...document.querySelectorAll('tr')].slice(1)
                .map(x => {
                    // console.log(x.textContent)
                    var result = x.textContent.trim().replace(/[\n\t]+/g, '\t').split('\t')

                    output.push({
                        id: result[0],
                        timeout: result[1].match('超過時間') != null,
                        success: result[1].match('通過') != null,
                        content: result[1]
                    })
                })

        } catch (e) {
            console.log(e)
            done()
        }


        done()
    })).catch(err => {
        console.error(err)
    })

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