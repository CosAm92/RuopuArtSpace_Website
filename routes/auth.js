const express = require('express')
const router = express.Router()

router.get('/ras-admin', (req, res) => {
    res.render('auth/register', {name: 'Amanda'})
})

router.get('/ras-adminLog', (req, res) => {
    res.render('auth/login', {name: 'Amanda'})
})

module.exports = router