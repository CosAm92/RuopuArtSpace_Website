const express = require('express') //Import librairy
const Article = require('./../models/article')
const Comment = require('./../models/comment')
const router = express.Router() //Gives us a router to create views

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

//Show an Article
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({
        slug: req.params.slug
    }).populate('comments').exec() //We await/wait for the article before executing function

    if (article == null) res.redirect('/articles') //If no articles are found, redirect to Articles
    res.render('articles/show', { article: article })
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
router.post('/:id/comment', async(req, res) => {
    const article = await Article.findOne({_id: req.params.id});

    const comment = new Comment({
        content: req.body.content,
        createdAt: new Date(req.body.createdAt),
        article: article._id
    });
    comment.save()

    //Associate Article with Comment
    article.comments.push(comment)
    article.save()

    res.send(article)
})

//Read a comment -> ISSUES with Populate
router.get('/:id/comment', async(req, res) => {
    const article = await Article.findById(req.params.id).populate('commentss').exec();
    res.send(article)
})

//Edit Comment Route
router.put('/comments/:commentId', async(req, res) => {
    const comment = await Comment.findOneAndUpdate({
        _id: req.params.commentId
    },
    req.body, 
    {new: true, runValidators: true})

    res.send(comment)
})

router.delete('/comments/:commentId', async(req, res) => {
    await Comment.findByIdAndRemove(req.params.id)
    res.send({message: "Comment deleted"})
})

//FUNCTIONS
//Request/Response function
function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        //Create a new article
        article.title = req.body.title
        article.summary = req.body.summary
        article.markdown = req.body.markdown

        //Save an article/Else redirect
        try {
            await article.save()
            res.redirect(`/articles/${article.slug}`) //Redirection to slug url if the article is not new
        } catch (e) {
            res.render(`/articles/${path}`, { article: article })
        }
    }
}

module.exports = router //We can read this router everywhere