const fs = require('fs')
const process = require('process')
const path = require('path')
const read_old = require('read')

var configPath = path.resolve('./config.json')
var key = require('./key').key

var cryptojs = require("crypto-js")


// important
function read(option = {}) {
    return new Promise(done => read_old(option,
        function (err, res, isDefaule) {
            if (err) process.exit(0)
            done(res)
        }))
}

exports.config = {
    public: {
        "Url": {
            "login": "https://140.124.184.228/_Exam/Login",
            "main": "https://140.124.184.228/_Exam/MainMenu",
            "welcome": "https://140.124.184.228/_Exam/DownMenu",
            "homework": {
                "show": "https://140.124.184.228/_Exam/showHomework",
                "del": "https://140.124.184.228/_Exam/delHw",
                "up": "https://140.124.184.228/_Exam/upLoadFile",
                "upid": "https://140.124.184.228/_Exam/upLoadHw",
                "result": "https://140.124.184.228/_Exam/CheckResult.jsp",
                "success": "https://140.124.184.228/_Exam/success.jsp",
                "board": "https://140.124.184.228/_Exam/HomeworkBoard"
            }
        },
        "courseId": 4,
        "exec": "python %1"
    },
    private: {
        "user": {
            "name": "username",
            "passwd": "password"
        },
    }
}

exports.load = async function () {
    if (fs.existsSync(configPath)) {
        var plaintext = fs.readFileSync(configPath).toString()
        var data = JSON.parse(plaintext)
        var decrypted = cryptojs.AES.decrypt(data.private, key).toString(cryptojs.enc.Utf8)
        data.private = JSON.parse(decrypted)
        Object.assign(exports.config, data)
    } else {
        console.log('you need to login first:')
        var username = await read({
            prompt: "username:"
        })
        var password = await read({
            prompt: "password:",
            silent: true,
            replace: "*"
        })

        exports.config.private.user.name = username
        exports.config.private.user.passwd = password
        exports.save()
    }
}

exports.save = function () {
    var data = JSON.parse(JSON.stringify(exports.config))
    data.private = cryptojs.AES.encrypt(JSON.stringify(data.private), key).toString()
    data = JSON.stringify(data)
    fs.writeFileSync(configPath, data)
}