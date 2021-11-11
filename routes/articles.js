const express = require('express') //Import librairy
const Article = require('../models/article')
const User = require('../models/user')
const Comment = require('../models/comment')
const router = express.Router() //Gives us a router to create views

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//ARTICLES
//Show all articles
/*router.get('/', async (req, res) => {
    const articles = await Article.find().sort({
        createdAt: 'desc' //Top article = newest one
    })

    res.render('articles/index', { articles: articles })
})*/

///articles?page=1&limit=4
router.get('/', paginationResults(Article), (req, res) => {
    res.render('articles/index', { articles: res.paginationResults.results, next: res.paginationResults.next, previous: res.paginationResults.previous })
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
            path: 'author',
            select: 'pseudo -_id', //exclude id
        }).
        populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'pseudo email -_id', //exclude id
            }
        }).
        populate({
            path: 'comments',
            populate: {
                path: 'replies',
            }
        }).
        populate({
            path: 'comments',
            populate: {
                path: 'replies',
                populate: { //Triple deep population is ez
                    path: 'author',
                    select: 'pseudo email -_id'
                }
            }
        }).exec() //We await/wait for the article before executing function

    //const next = await Article.findOne({createdAt: {$lt: article.createdAt}}).limit(1)
    //const previous = await Article.findOne({createdAt: {$gt: article.createdAt}}).limit(1)

    const previous = await Article.findOne({ _id: { $lt: article._id } }).sort({ _id: -1 }).limit(1)
    const next = await Article.findOne({ _id: { $gt: article._id } }).sort({ _id: 1 }).limit(1)

    if (article == null) res.redirect('/articles') //If no articles are found, redirect to Articles
    res.render('articles/show', { article: article, previous: previous, next: next })
})

//Like an article
router.put('/:slug/like', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug })
        //await article.updateOne({ $push: { likes: req.body.test } })
        if (!article.likes.includes(req.body.userId)) {
            await article.updateOne({ $push: { likes: req.body.userId } })
        } else {
            await article.updateOne({ $pull: { likes: req.body.userId } })
        }
        res.redirect(`/articles/${article.slug}`)
    } catch (err) {
        res.status(500).json(err)
    }
})

router.put('/:slug/:commentId/like', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug })
        let comment
        comment = await Comment.findById(req.params.commentId)
        if (!comment.likes.includes(req.body.userId)) {
            await comment.updateOne({ $push: { likes: req.body.userId } })
        } else {
            await comment.updateOne({ $pull: { likes: req.body.userId } })
        }
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
/*router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next() //Go to the next function
}, saveArticleAndRedirect('new'))*/

router.put('/:id', async (req, res) => {
    //Save artwork
    let article
    try {
        article = await Article.findById(req.params.id)
        article.title = req.body.title
        //article.author = '613f7f62cb162826bc77ae14'//req.body.author PLACEHOLDER TO CHANGE WHEN USER LOG ADDED
        //article.createdAt = new Date(req.body.createdAt)
        article.summary = req.body.summary
        article.markdown = req.body.markdown

        if (req.body.image != null && req.body.image !== '') {
            saveImage(article, req.body.image)
        } //The default is null, we don't want to delete the cover
        await article.save()
        res.redirect(`/articles/${article.slug}`)
    } catch {
        if (article != null) {
            renderEditPage(res, article, true) //Useless?
        } else {
            res.redirect('/')
        }
    }
})

//Delete an Article
router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect(`/articles?page=1&limit=3`) //Maybe too hard coded but it's the only way to change the url
    //res.render('articles/index' , { articles: res.paginationResults.results, next: res.paginationResults.next, previous: res.paginationResults.previous})
})


//COMMENTS
//Create a comment route
router.post('/:slug', async (req, res, next) => {
    const article = await Article.findOne({
        slug: req.params.slug
    }).
        populate('comments').exec()

    const author = await User.findOne({ email: session.userId })

    const comment = new Comment({
        author: author, //PLACEHOLDER -> CHANGE WHEN LOGIN/REGISTER CREATED
        content: req.body.content,
        //createdAt: new Date(req.body.createdAt),
        article: article._id
    });
    await comment.save()

    //Associate Article with Comment
    article.comments.push(comment)
    await article.save()

    next()
    //res.render('articles/show', { article: article })
}, renderArticle())

//Edit Comment Route
router.put('/:slug/:commentId', async (req, res, next) => {
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
router.delete('/:slug/:commentId', async (req, res, next) => {
    const article = await Article.findOne({
        slug: req.params.slug
    })

    const comment = req.params.commentId
    var idx = article.comments.indexOf(`${comment}`)
    if (idx != -1) article.comments.splice(idx, 1)
    await article.save()

    await Comment.findByIdAndDelete(req.params.commentId)
    next()
}, renderArticle())

//REPLIES
//Create Reply Route
router.post('/:slug/:commentId', async (req, res, next) => {
    const article = await Article.findOne({
        slug: req.params.slug
    })

    let comment

    try {
        comment = await Comment.findById(req.params.commentId)
        const author = await User.findOne({ email: session.userId })

        const reply = new Comment({
            author: author,
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
        const author = await User.findOne({ email: session.userId })
        //Create a new article
        article.author = author
        article.title = req.body.title
        article.summary = req.body.summary
        article.markdown = req.body.markdown

        saveImage(article, req.body.image) //OK ISSUE HERE

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
function renderArticle() {
    return async (req, res) => {
        const article = await Article.findOne({
            slug: req.params.slug
        }).
            populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'pseudo -_id', //exclude id
                }
            }).
            populate({
                path: 'comments',
                populate: {
                    path: 'replies',
                    model: 'Comment'
                }
            })
            .exec()

        res.redirect(`/articles/${article.slug}`)
    }
}

//Same as Artwork's to Optimize
function saveImage(article, imageEncode) {
    //Is it valid?
    if (imageEncode == null) return
    const image = JSON.parse(imageEncode)
    if (image != null && imageMimeTypes.includes(image.type)) {
        article.image = new Buffer.from(image.data, 'base64')
        article.imageType = image.type
    }
}

///Maybe useless (cf Edit route)
async function renderEditPage(res, article, hasError = false) {
    renderFormPage(res, article, 'edit', hasError)
}
async function renderFormPage(res, article, form, hasError = false) { //res to render/redirect, artwork = new or existing one
    try {
        const params = {
            article: article
        }
        /*const authors = await Author.find({})
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Editing Artwork'
            } else {
                params.errorMessage = 'Error Creating Artwork'
            }
        }*/
        res.render(`articles/${form}`, params)
    } catch {
        res.redirect('/articles')
    }
    //res.render("artwork/new", { artwork: new Artwork() })
}

///PAGINATION
function paginationResults(model) {
    return async (req, res, next) => {

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}
        if (endIndex < await model.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) { //Check if we're at page 1
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            results.results = await model.find().sort({
                createdAt: 'desc' //Top article = newest one
            }).limit(limit).skip(startIndex).exec()
            res.paginationResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}


module.exports = router //We can read this router everywhere