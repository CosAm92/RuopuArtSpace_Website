const express = require('express')
const Article = require('../models/article')
const Artwork = require('../models/artwork')
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

/* SEARCH */
router.searchAll = async(req, res) => {
    try{
        let searchTerm = req.body.searchTerm//searchTerm is the name of search form in header
        let articles = await Article.find({ $text: { $search: searchTerm}})
        let artworks = await Artwork.find({ $text: { $search: searchTerm}})
        /*let articles = await Article.find(
            // Find documents matching any of these values
            {$or:[
                {title:{$in:[searchTerm]}},
                {summary:{$in:[searchTerm]}}
            ]}
        )*/
        
        res.render('search', {title: 'RAS - Search', articles, artworks})
    } catch(err) {
        res.status(500).send({message: err.message || "Error on Search"})
    }
}

module.exports = router