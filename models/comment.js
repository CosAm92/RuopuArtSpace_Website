const mongoose = require('mongoose')
const Article = require('./article')

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, //Get name and email from here
        ref: 'User' //TO CREATE
    },
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
    }, 
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    isReply: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Comment', commentSchema)