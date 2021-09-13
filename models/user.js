const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    pseudo: {
        type: String
    },
    email: {
        type: String
    },
    role: {
        type: String
    },
    password: {
        type: String
    },
    token: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)
