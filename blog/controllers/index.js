const router = require("express").Router()
const {userExtractor} = require('../utils/middleware')

router.use('/api/blogs', userExtractor, require('./blog'))
// router.use('/api/blogs', require('./blog'))
router.use('/api/users', require('./user'))
router.use('/api/login', require('./login'))

// If in test mode expose testing routes
if (process.env.NODE_ENV === 'test') {
  router.use('/api/testing', require('./testing'))
}

module.exports = router