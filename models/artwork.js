const mongoose = require('mongoose')
const artworkImageBasePath = 'uploads/artworkImage'
const path = require('path')

const artworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: "Anonymous"
    },
    content: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    image: {
        type: Buffer, //Buffer of the data representing the image
        required: true
    },
    imageType: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        enum: ["Ruopu 1000", "Transform Now", "My Design Helps You"]
    },
    tags: {
        type: Array
    }
})

//derives artworkImagePath value from previous variables
artworkSchema.virtual('artworkImagePath').get(function() {
    if(this.image != null && this.imageType != null){
/*return path.join('/', artworkImageBasePath, this.image)*/
return `data:${this.imageType};charset=utf-8;base64,${
    this.image.toString('base64')}`
    }
})

artworkSchema.index({title: 'text', content: 'text', theme: 'text', tags: 'text', author: 'text'})

module.exports = mongoose.model('Artwork', artworkSchema)
module.exports.artworkImageBasePath = artworkImageBasePath