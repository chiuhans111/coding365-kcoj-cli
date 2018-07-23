var Router = require('koa-router')
var router = new Router()

router.use('/api/v1', require('./v1').routes())


module.exports = router