const request = require('request').defaults({ rejectUnauthorized: false })
const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')
// require('request').debug = true
var j = require('request').jar()


const config1 = require('./config/public')
const config2 = require('./config/private')

var cookie = null

exports.login = function () {
    return new Promise((done, error) => request.post(config1.Url.login, {
        form: {
            name: config2.user.name,
            passwd: config2.user.passwd,
            rdoCourse: config2.courseId
        },
        jar: j
    }, done))
}

exports.homework_show = function (hwId) {
    return new Promise((done, error) => request.post(config1.Url.homework.show, {
        qs: { hwId },
        jar: j
    }, function (err, res, body) {
        var document = (new jsdom.JSDOM(body)).window.document
        var content = [...document.body.childNodes]
            .filter(x => x.nodeType == x.TEXT_NODE)
            .map(x => "  " + x.nodeValue.trim()).join('\n')
        done(content)
    }))
}

exports.homework_del = function (title) {
    return new Promise((done, error) => request.post(config1.Url.homework.del, {
        qs: { title },
        jar: j
    }, function (err, res, body) {
        var document = (new jsdom.JSDOM(body)).window.document
        var content = document.body.textContent
        done(content)
    }))
}

exports.homework_up = function (hwId, filepath, desc = '') {
    return new Promise((done, error) => {
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
            form.append('hwFile', fs.createReadStream(filepath))
            form.append('FileDesc', desc)
        })
    })
}


exports.homework_result = function (questionID, studentID) {
    if (studentID == null) studentID = config2.user.name
    return new Promise((done, error) => request.get(config1.Url.homework.result, {
        qs: { questionID, studentID },
        jar: j
    }, function (err, res, body) {
        var document = (new jsdom.JSDOM(body)).window.document
        //console.log(body)
        var content = [...document.querySelectorAll('tr')]
            .map(x => x.textContent.trim().replace(/[\n\t]+/g, '\t'))
            .join('\n') + '\n progress:\t' + document.querySelector('.progress,.alert').textContent.trim()
        done(content)
    }))
}