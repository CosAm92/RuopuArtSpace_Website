const mongoose = require('mongoose')
const Artwork = require('./artwork')
const Article = require('./article')

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Tag', tagSchema)