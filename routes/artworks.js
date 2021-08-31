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
        res.redirect(`artworks/${newArtwork.id}`)
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

//Edit Artwork figcaption
router.get('/:id/edit', async (req,res) => {
    try{
        const artwork = await Artwork.findById(req.params.id)
        renderEditPage(res, artwork)
    } catch {
        res.redirect('/')
    }
})

//Update artwork route
router.put('/:id', upload.single('image'), async (req, res) => { 
    let artwork
    //Save artwork
    try {
        artwork = await Artwork.findById(req.params.id)
        artwork.title = req.body.titleartwork.author = req.body.author
        artwork.createdAt = new Date(req.body.createdAt)
        artwork.content = req.body.content
        if(req.body.image != null && req.body.image !== ''){
            //saveCover(artwork, req.body.image)
        }
        await artwork.save()
        res.redirect(`/artworks/${artwork.id}`)
    } catch (err) {
        console.log(err)
        if(artwork != null){
            renderEditPage(res, artwork, true)
        } else {
            res.redirect('/')
        }   
    }
})

router.delete('/:id', async (req,res) => {
    let artwork
    try{
        artwork = await Artwork.findById(req.params.id)
        //TODO: use fs unlink path to image to remove image 
        await artwork.remove()
        res.redirect('/artworks')
    } catch {
        if(artworks != null) //If the artwork exist
        {
            res.render('artworks/show', {
                artwork: artwork,
                errorMessage: 'Could not delete artwork'
            })
        } else {
            res.redirect('/')
        }
    }
})

//Show error to dev
function removeArtworkImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(res, artwork, hasError = false){ //res to render/redirect, artwork = new or existing one
    renderFormPage(res, artwork, 'new', hasError)
}

async function renderEditPage(res, artwork, hasError=false){
    renderFormPage(res, artwork, 'edit', hasError)
}

//Optimization to avoid duplicating code for New/Edit
async function renderFormPage(res, artwork, form, hasError = false){ //res to render/redirect, artwork = new or existing one
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            artwork: artwork
        }
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = 'Error Editing Artwork'
            }
        } else {
            params.errorMessage = 'Error Creating Artwork'
        }
        res.render(`artworks/${form}`, params)
    } catch {
        res.redirect('/artworks')
    }
    //res.render("artwork/new", { artwork: new Artwork() })
}

module.exports = router