const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedPass) {
        if(err) {
            res.json({
                error: err
            })
        }

        let user = new User ({
            pseudo: req.body.pseudo,
            email: req.body.email,
            role: req.body.role,
            password: hashedPass
        })
    
        user.save()
        .then(user => {
            res.json({
                message: 'User added to db'
            })
        })
        .catch(error => {
            res.json({
                message: 'Error while saving user'
            })
        })
    })
}

const login = (req, res, next) =>  {
    var pseudo = req.body.pseudo
    var password = req.body.password

    //Search if the user exists or not if someone sends an email/pseudo
    User.findOne({$or: [{email: pseudo}, {pseudo:pseudo}]})
    .then(user => {
        if(user){
            //If user exists, compare passwords
            bcrypt.compare(password, user.password, function(err, result){
                if(err){
                    res.json({
                        error: err
                    })
                }
                //If passwords match, create token and redirect to homepage
                if(result){
                    let token = jwt.sign({pseudo: user.pseudo}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
                    res.json({
                        message: token
                    })
                    //res.redirect('/')
                } else {
                    res.json({
                        message: 'Password is wrong'
                    })
                }
            })
        } else {
            res.json({
                message: 'No user found'
            })
        }
    })
}

module.exports = {register, login}