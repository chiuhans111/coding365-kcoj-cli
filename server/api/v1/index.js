var Router = require('koa-router')
var router = new Router()

var basic = require('./utils/basic')
var rank = require('./utils/rank')
var query = require('./utils/query')
var formated = require('./utils/formated')

router.get('/', ctx => ctx.body = 'welcome to api v1')
router.get('/all', async ctx => ctx.body = await basic.all())
router.get('/last', async ctx => ctx.body = await basic.last())
router.get('/rank', async ctx => ctx.body = await rank.rank())

router.get('/formated', async ctx => {
    ctx.body = await formated.formated(ctx.query)
})

router.get('/q', async ctx => {
    ctx.body = await query.query(ctx.query)
})


module.exports = router