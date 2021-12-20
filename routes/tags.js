const express = require('express') //Import librairy
const router = express.Router() //Gives us a router to create views
const Tag = require('../models/tag')
const Article = require('../models/article')
const Artwork = require('../models/artwork')

router.get('/', async(req, res)=>{
    res.redirect('/')
})

router.searchTags = async(req, res) => {
    try{
        let searchTags = req.body.searchTags//searchTerm is the name of search form in header
        let articles = await Article.find({ $text: { $search: searchTags}})
        let artworks = await Artwork.find({ $text: { $search: searchTags}})
        //let articles = await Article.find({ tags: {$in:[searchTags]}})
        //let artworks = await Artwork.find({ tags: {$in:[searchTags]}})
        res.render('search', {title: 'RAS - Search', articles, artworks})
    } catch(err) {
        res.status(500).send({message: err.message || "Error on Search"})
    }
}

module.exports = router