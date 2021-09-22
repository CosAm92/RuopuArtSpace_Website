const mongoose = require('mongoose')
const Article = require('./article')

const commentSchema = new mongoose.Schema({
    /*username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' //TO CREATE
    },*/
    content: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }
})

module.exports = mongoose.model('Comment', commentSchema)