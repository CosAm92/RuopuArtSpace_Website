const express = require('express') 
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.send('Login')
})

//Register
router.get('/register', (req, res) => {
    res.render('auth/register')
})

router.post('/register', async (req, res) => {
    try{
        //Generate a salt before generating a hashed password for protection
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        //Create new user
        const newUser = new User({
            pseudo: req.body.pseudo,
            email: req.body.email,
            password: hashedPassword
        })

        await newUser.save();
        res.redirect('/')
    } catch(e){
        console.log(e)
    }
})

//Login
router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne({email: req.body.email, pseudo: req.body.pseudo})
        !user && res.status(404).json("User not found")
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(404).json("Wrong password")

        session=req.session
        session.user_id = user._id
        session.userId=user.email
        session.userIsAdmin= user.isAdmin
        session.userRole = user.role

        res.redirect('/')
    } catch(e) {
        console.log(e)
    }
})

router.get('/logout',(req,res) => {
    req.session.destroy();
    res.locals = null;
    res.redirect('/');
});

module.exports = router
