const express = require('express') //Import librairy
const router = express.Router() //Gives us a router to create views
const multer = require('multer')
const path = require('path')
const fs = require('fs') //File systeme build in Node.js

const Artwork = require('../models/artwork')
const Author = require('../models/author')

const uploadPath = path.join('public', Artwork.artworkImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'] //We want the server to support these mime types
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})


//Show all artworks/the Art Gallery
router.get('/', async (req, res) => {
    let query = Artwork.find() //let != const (const reasigns the variable)
    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    try{
        const artworks = await query.exec()
        res.render('artworks/index', {
            artworks: artworks,
            searchOptions: req.query,
        })
    } catch {
        res.redirect('/')
    }
})

//New artwork route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Artwork())
})

//Add artwork route
router.post('/', upload.single('image'), async (req, res) => { //The library multer does the work of putting the file in the correct folder for us
    const fileName = req.file != null ? req.file.filename : null //Get file name if it exists
    //Create new Artwork object
    const artwork = new Artwork({
        title: req.body.title,
        author: req.body.author,
        createdAt: new Date(req.body.createdAt),
        image: fileName,
        content: req.body.content
    })

    //Save artwork
    try {
        const newArtwork = await artwork.save()
        //res.redirect(`artworks/${newArtwork.id}`)
        res.redirect('artworks')
    } catch {
        if(artwork.image != null){
            removeArtworkImage(artwork.image)
        }
        renderNewPage(res, artwork, true)
    }
})

//Show info
router.get('/:id', async (req, res) => {
    try{
        const artwork = await Artwork.findById(req.params.id)
        .populate('author').exec() //populate makes the id the full object
        res.render('artworks/show', {artwork: artwork})
    } catch {
        res.redirect('/')
    }
})

//Show error to dev
function removeArtworkImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(res, artwork, hasError = false){ //res to render/redirect, artwork = new or existing one
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            artwork: artwork
        }
        if(hasError) params.errorMessage = 'Error Creating Artwork'
        res.render('artworks/new', params)
    } catch {
        res.redirect('/artworks')
    }
    //res.render("artwork/new", { artwork: new Artwork() })
}

module.exports = router