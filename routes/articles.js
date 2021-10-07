const express = require('express') //Import librairy
const Article = require('../models/article')
const User = require('../models/user')
const Comment = require('../models/comment')
const router = express.Router() //Gives us a router to create views

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//ARTICLES
//Show all articles
router.get('/', async (req,res) =>{
    const articles = await Article.find().sort({
        createdAt: 'desc' //Top article = newest one
    })
    res.render('articles/index', {articles: articles})
})

//Go to Create Form
router.get('/new', (req, res) => {
    res.render("articles/new", { article: new Article() })
}) 

//Go to Edit Form
router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render("articles/edit", { article: article })
})

//Show an Article + its Comments
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({
        slug: req.params.slug
    }).
    populate({
        path : 'author',
            select: 'pseudo -_id', //exclude id
     }).
    populate({
        path : 'comments',
        populate: {
            path: 'author',
            select: 'pseudo -_id', //exclude id
        }
      }).
      populate({
        path : 'comments',
        populate : {
            path : 'replies'
        }
      }).exec() //We await/wait for the article before executing function

    if (article == null) res.redirect('/articles') //If no articles are found, redirect to Articles
    res.render('articles/show', { article: article })
})

//Like an article
router.put('/:slug/like', async (req, res) => {
    try {
        const article = await Article.findOne({slug: req.params.slug})
        await article.updateOne({$push:{likes: req.body.test}})
        /*if(!article.likes.includes(req.body.userId)){
            await article.updateOne({$push:{likes: req.body.userId}})
        } else {
            await article.updateOne({$pull: {likes: req.body.userId}})
        }*/ //ADD WHEN USER LOGIN/REGISTER IS DONE
        res.redirect(`/articles/${article.slug}`)
    } catch (err) {
        res.status(500).json(err)
    }
})

router.put('/:slug/:commentId/like', async (req, res) => {
    try {
        const article = await Article.findOne({slug: req.params.slug})
        let comment
        comment = await Comment.findById(req.params.commentId)
        await comment.updateOne({$push:{likes: req.body.test}})
        //
        res.redirect(`/articles/${article.slug}`)
    } catch (err) {
        res.status(500).json(err)
    }
})

//Create new Article
router.post('/', async (req, res, next) => { //Get POST from new.ejs form and save to db
    req.article = new Article()
    next() //Go to the next function
}, saveArticleAndRedirect('new'))

//Edit an Article
router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next() //Go to the next function
}, saveArticleAndRedirect('new'))

//Delete an Article
router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/articles')
})


//COMMENTS
//Create a comment route
router.post('/:slug', async(req, res) => {
    const article = await Article.findOne({
        slug: req.params.slug
    }).
    populate('comments').exec()

    const comment = new Comment({
        author: '613f7f62cb162826bc77ae14', //PLACEHOLDER -> CHANGE WHEN LOGIN/REGISTER CREATED
        content: req.body.content,
        //createdAt: new Date(req.body.createdAt),
        article: article._id
    });
    await comment.save()

    //Associate Article with Comment
    article.comments.push(comment)
    await article.save()

    res.render('articles/show', { article: article })
})

//Edit Comment Route
router.put('/:slug/:commentId', async(req, res, next) => {
    let comment
    try {
        comment = await Comment.findById(req.params.commentId)
        comment.content = req.body.content
        await comment.save()
        next()
    } catch {
        //
    }

}, renderArticle())

//Delete Comment Route + Delete Comment from Comments Array of Article
router.delete('/:slug/:commentId', async(req, res, next) => {
    const article = await Article.findOne({
        slug: req.params.slug
    })

    const comment = req.params.commentId
    var idx = article.comments.indexOf(`${comment}`)
    if(idx != -1) article.comments.splice(idx, 1)
    await article.save()

    await Comment.findByIdAndDelete(req.params.commentId)
    next()
}, renderArticle())

//REPLIES
//Create Reply Route
router.post('/:slug/:commentId', async(req, res, next) => {
    const article = await Article.findOne({
        slug: req.params.slug
    })

    let comment
    
    try {
        comment = await Comment.findById(req.params.commentId)
        const reply = new Comment({
            content: req.body.content,
            //createdAt: new Date(req.body.createdAt),
            article: article._id,
            isReply: true
        });
        await reply.save()

        //Associate Comment with Reply
        comment.replies.push(reply)
        await comment.save()

        await article.save()
        
        next()
    } catch {
        //
    }

}, renderArticle())

//FUNCTIONS
//Request/Response function
function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        //Create a new article
        article.title = req.body.title
        article.summary = req.body.summary
        article.markdown = req.body.markdown

        saveImage(article, req.body.image)

        //Save an article/Else redirect
        try {
            await article.save()
            res.redirect(`/articles/${article.slug}`) //Redirection to slug url if the article is not new
        } catch (e) {
            res.render(`/articles/${path}`, { article: article })
        }
    }
}

//Next of Comment changes
function renderArticle(){
    return async(req, res) => {
        const article = await Article.findOne({
            slug: req.params.slug
        }).
        populate({
            path : 'comments',
            populate: {
                path: 'author',
                select: 'pseudo -_id', //exclude id
            }
          }).
          populate({
            path : 'comments',
            populate : {
                path : 'replies'
            }
          }).exec()
        res.redirect(`/articles/${article.slug}`)
    }
}

//Same as Artwork's to Optimize
function saveImage(artwork, imageEncode) {
    //Is it valid?
    if (imageEncode == null) return
    const image = JSON.parse(imageEncode)
    if (image != null && imageMimeTypes.includes(image.type)) {
        artwork.image = new Buffer.from(image.data, 'base64')
        artwork.imageType = image.type
    }
}

module.exports = router //We can read this router everywhere