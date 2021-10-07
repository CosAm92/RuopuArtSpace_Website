const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const{JSDOM} = require('jsdom') //put in {} cuz we only want the JSDOM portion of the library
const dompurify = createDomPurify(new JSDOM().window) //dompurify creates HTML which is purified by the JSDOM object
const Comment = require('./comment')
const User = require('./user')

const articleImageBasePath = 'uploads/articleImage'

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    summary: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    comments:[ //Array of comments 
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Comment'
        }
    ],
    likes: {
        type: Array,
        default: []
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
        type: String //TODO: change to array of Tags with Tag a predetermined object that can be modified (like author)
        //1 theme = 1 color
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

//Constraints so that a Comment of an Article can't exist if Article is erased
/*articleSchema.pre('remove', function(next){
    Comment.find({ article: this.id}, (err, comments) =>{
        if(err){
            next(err)
        } else if (comments.length > 0){
            //Remove Each Comment
        } else {
            next()
        }
    })
})*/

//Same as Artwork -> To Optimize
articleSchema.virtual('articleImagePath').get(function() {
    if(this.image != null && this.imageType != null){
/*return path.join('/', artworkImageBasePath, this.image)*/
return `data:${this.imageType};charset=utf-8;base64,${
    this.image.toString('base64')}`
    }
})

module.exports = mongoose.model('Article', articleSchema)
module.exports.articleImageBasePath = articleImageBasePath