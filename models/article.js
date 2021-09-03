const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const{JSDOM} = require('jsdom') //put in {} cuz we only want the JSDOM portion of the library
const dompurify = createDomPurify(new JSDOM().window) //dompurify creates HTML which is purified by the JSDOM object

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true //Unique slug for each article
    },
    sanitizedHTML:{
        type: String,
        required: true
    }
})

//Set validation after creating slug from title
articleSchema.pre('validate', function (next) {
    if (this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true })
    } //Gets rid of characters that doesnt fit url
   
    if(this.markdown){
        this.sanitizedHTML = dompurify.sanitize(marked(this.markdown)) 
    } //Gets rid of any malicious code inserted into the markdown/escape HTML characters
   
    next()
})

module.exports = mongoose.model('Article', articleSchema)