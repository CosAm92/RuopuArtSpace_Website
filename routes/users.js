const express = require('express') 
const User = require('../models/user')
const router = express.Router()

const {authUser, authAdmin} = require('./middleware/basicAuth')
const passport = require('passport')
//const initializePassport = require('./middleware/passport-config')

//initializePassport(passport, email => users.find(user => user.email === email))

router.get('/', authUser, async (req, res) => {
    const user = await User.findOne({email: session.userId})
    res.send("Hey " + user.pseudo)
})

router.get('/session',(req,res) => {
    if(session.userId){
        res.send("Welcome User <a href=\'/auth/logout'>click to logout</a>");
    }else
    res.redirect('/')
});

router.get('/admin', authUser, authAdmin, async (req, res) => {
    res.send("Admin") //Test to see if user is logged and admin
})

module.exports = router
