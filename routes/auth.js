const express = require('express')
const router = express.Router()

//Oath
const authController = require('../permissions/authController')

router.get('/ras-admin', (req, res) => {
    res.render('auth/register', {name: 'Amanda'})
})

router.get('/ras-adminLog', (req, res) => {
    res.render('auth/login', {name: 'Amanda'})
})

router.post('/ras-admin', authController.register)
router.post('/ras-adminLog', authController.login)
module.exports = router