const mongoose = require('mongoose')
const Artwork = require('./artwork')
/*const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const{JSDOM} = require('jsdom') //put in {} cuz we only want the JSDOM portion of the library
const dompurify = createDomPurify(new JSDOM().window) //dompurify creates HTML which is purified by the JSDOM object
*/

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

//Constraints so that an artwork with an author can't have an inexistant author
authorSchema.pre('remove', function(next){
    Artwork.find({ author: this.id}, (err, artworks) =>{
        if(err){
            next(err)
        } else if (artworks.length > 0){
            next(new Error('This author has books still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema)