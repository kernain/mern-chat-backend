const express = require('express')
const router = express.Router()

router.use('/auth', require('./auth.js'))
router.use('/messages', require('./messages.js'))
router.use('/people', require('./people.js'))

module.exports = router