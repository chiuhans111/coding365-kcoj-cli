
// APP
const Koa = require('koa');
const koaStatic = require('koa-static')

const app = new Koa();
var db = require('./server/database')


// DATABASE
var students = require('./students')
var Student = require('./server/database/schema/student')

// API
var api = require('./server/api')


updateStudent = false
// OTHER
const process = require('process')
const config = require('./bot/config/config')
var grap = require('./grap')


var lastGrap = 0
var interval = 30 * 60 * 60 * 1000

async function main() {
    var now = Date.now()
    var delta = now - lastGrap;

    if (now - lastGrap > interval) {
        console.log('START GRAP')
        lastGrap = Date.now()
        await grap.graps()
        var end = Date.now()
        var pass = end - now
        console.log('GRAP SUCCESS, took', pass)
    } else {
        console.log('NEXT GRAP:', delta - interval)
    }
    await new Promise(done => setTimeout(done, 2000))
    await main()
}


module.exports = function ({
    grap = false,
    useApi = false
}) {

    if (useApi) {
        app.use(api.routes())
        app.listen(80);
        app.use(koaStatic('./server/public/'))
    }

    if (grap) {
        db.db.once('open', async function () {
            console.log('database connected')

            if (updateStudent) {
                console.log('update students')
                for (var i in students) {
                    await Student.findOneAndUpdate({ id: i }, {
                        id: i,
                        name: students[i].name,
                        github: students[i].github
                    }, { upsert: true }).then()
                    process.stdout.write('  updated:' + i + '\r')
                }
                console.log('done               ')
            }
            main()
        })
    }

    db.connect()
}