const mongoose = require('mongoose')
const artworkImageBasePath = 'uploads/artworkImage'
const path = require('path')

const artworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author' //Must match the name of the model
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
        type: String,
        required: true
    },
    theme: {
        type: String //TODO: change to array of Tags with Tag a predetermined object that can be modified (like author)
        //1 theme = 1 color
    }
})

//derives artworkImagePath value from previous variables
artworkSchema.virtual('artworkImagePath').get(function() {
    if(this.image != null){
return path.join('/', artworkImageBasePath, this.image)
    }
})

module.exports = mongoose.model('Artwork', artworkSchema)
module.exports.artworkImageBasePath = artworkImageBasePath