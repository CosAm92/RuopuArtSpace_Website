const express = require('express') //Import librairy
const Article = require('./../models/article')
const router = express.Router() //Gives us a router to create views

router.get('/new', (req, res) => {
    //res.send('Typical article page') //Simple request right?
    res.render("articles/new", { article: new Article() })
})

router.get('/:id', (req, res) => {
    res.send(req.params.id)
})

router.post('/', async (req, res) => { //Get POST from new.ejs form and save to db
    let article = new Article({
        title: req.body.title,
        summary: req.body.summary,
        markdown: req.body.markdown
    })
    try {
        await article.save() //async/await
        res.redirect(`/articles/${article.id}`) //Redirection to :id if the article is not new
    } catch (e) {
        console.log(e)
        res.render('articles/new', { article: article }) //We still pass the info
    }
})

module.exports = router //We can read this router everywhere