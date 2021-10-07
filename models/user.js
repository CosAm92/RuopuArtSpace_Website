const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    pseudo: {
        type: String,
        require: true,
        min: 3,
        max: 20,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String
    },
    password: {
        type: String
    },
    token: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', userSchema)