const express = require('express')
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcrypt')

const { authUser, authAdmin } = require('./middleware/basicAuth')
const passport = require('passport')
//const initializePassport = require('./middleware/passport-config')
//initializePassport(passport, email => users.find(user => user.email === email))

/*Session tests
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
*/

//Show all users
/*router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.pseudo = new RegExp(req.query.name, 'i') // i regex = case insesitive Maj || min
    }
    try {
        const users = await User.find(searchOptions)
        res.render('users/index', {
            users: users,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})*/

router.get('/', paginationResults(User), async (req, res) => {
    res.render('users/index', { users: res.paginationResults.results, next: res.paginationResults.next, previous: res.paginationResults.previous, count: res.paginationResults.count, searchOptions: req.query })
})

//New user route
router.get('/new', (req, res) => {
    res.render("users/new", { user: new User() })
})

//Create user route
router.post('/', async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        pseudo: req.body.pseudo,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    })
    try {
        const newUser = await user.save()
        res.redirect(`/users?page=1&limit=3&name=`)
    } catch {
        res.render('users/new', {
            user: user,
            errorMessage: 'Error creating User'
        })
    }

})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.render("users/edit", { user: user })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
            const user = await User.findById(req.params.id)
            res.render("users/edit", { user: user })
    } catch {
        res.redirect('/')
    }
})

router.put('/:id', authUser, async (req, res) => {
    let user
    const current_user = await User.findOne({ email: session.userId })
    try {
        if (current_user._id == req.params.id || current_user.isAdmin) {
            user = await User.findById(req.params.id)
            user.pseudo = req.body.pseudo
            user.email = req.body.email
            user.role = req.body.role
            await user.save()

            if (current_user.isAdmin) {
                res.redirect(`/users?page=1&limit=3&name=`)
            } else {
                res.redirect(`/`)
            }
        } else {
            res.redirect(`/`)
        }

    } catch {
        if (user == null) {
            res.redirect('/')
        } else {
            res.render('users/edit', {
                user: user,
                errorMessage: 'Error updating User'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let user
    try {
        user = await User.findById(req.params.id)
        await user.remove()
        res.redirect('/users?page=1&limit=3&name=')
    } catch {
        res.redirect('/')
    }
})

///PAGINATION
function paginationResults(model) {
    return async (req, res, next) => {

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        var name = req.query.name
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        //title: { $regex: /^title/i}
        let count = await model.find({ pseudo: { $regex: name } }).countDocuments()
        if (name == '' || name == null) {
            count = await model.find().countDocuments()
        }

        const results = {}
        if (endIndex < count) {
            results.next = {
                page: page + 1,
                limit: limit,
                name: name
            }
        }

        if (startIndex > 0) { //Check if we're at page 1
            results.previous = {
                page: page - 1,
                limit: limit,
                name: name
            }
        }

        try {
            let query = model.find({ pseudo: { $regex: name } }).sort().limit(limit).skip(startIndex)

            results.results = await query.exec()
            results.count = {
                count: Math.ceil(count / limit),
                limit: limit,
                name: name
            }

            res.paginationResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}
module.exports = router
