const mongoose = require('mongoose')
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

module.exports = mongoose.model('Author', authorSchema)