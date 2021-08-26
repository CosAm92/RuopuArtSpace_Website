const express = require('express')
const router = express.Router()
const Article = require('../models/article')

router.get('/', async (req, res) => {
    res.send('Home Route Test')
    let articles
    try {
        articles = await Article.find().sort({createdAt: 'desc'})
        .limit(3).exec() //Get the 3 last articles
    } catch {
       articles = [] 
    }
    res.render('index', {articles: articles})
})

module.exports = router