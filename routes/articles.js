const express = require('express') //Import librairy
const Article = require('./../models/article')
const router = express.Router() //Gives us a router to create views

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
    }) //We await/wait for the article before executing function
    if (article == null) res.redirect('/') //If no articles are found, redirect to HomePage
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
    res.redirect('/')
})

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
            res.render(`articles/${path}`, { article: article })
        }
    }
}

module.exports = router //We can read this router everywhere