const express = require('express')
const Article = require('../models/article')
const Author = require('../models/author')
const router = express.Router()

//TODO: Show the last 3 articles/events on the Home Page
router.get('/', async (req, res) => {
    let articles
    let authors
    try {
        articles = await Article.find().sort({
            createdAt: 'desc'
        }).limit(3).exec() //Get the 3 last articles
        authors = await Author.find().limit(4)
    } catch {
       articles = []
    }
    res.render('index', {articles: articles, authors: authors})
})
module.exports = router