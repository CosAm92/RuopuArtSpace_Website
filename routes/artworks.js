const express = require('express') //Import librairy
const router = express.Router() //Gives us a router to create views
const multer = require('multer')
const path = require('path')
const fs = require('fs') //File systeme build in Node.js

const Artwork = require('../models/artwork')
const Author = require('../models/author')

const uploadPath = path.join('public', Artwork.artworkImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'] //We want the server to support these mime types
/* const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
}) */


//Show all artworks/the Art Gallery
/*router.get('/', async (req, res) => {
    /*let query = Artwork.find().sort({
        createdAt: 'desc' //Top article = newest one
    }).limit(parseInt(req.query.limit)) //let != const (const reasigns the variable)
    

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    if (endIndex < await Artwork.countDocuments().exec()) {
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

    res.paginationResults = results

    try {
        let query = Artwork.find().sort({
            createdAt: 'desc' //Top article = newest one
        }).limit(limit).skip(startIndex)

        if (req.query.title != null && req.query.title != '') {
            query = query.regex('title', new RegExp(req.query.title, 'i'))
        }
    
        try {
            const artworks = await query.exec()
            //res.json(res.paginationResults)

            res.render('artworks/index', {
                artworks: artworks,
                searchOptions: req.query,
                //artworks: res.paginationResults.results,
                next: res.paginationResults.next, 
                previous: res.paginationResults.previous,
                title: req.query.title 
            })
        } catch {
            res.redirect('/')
        }

        //next()
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})*/


router.get('/', paginationResults(Artwork), async (req, res) => {
    res.render('artworks/index', { artworks: res.paginationResults.results, next: res.paginationResults.next, previous: res.paginationResults.previous, count: res.paginationResults.count, searchOptions: req.query })
})

//New artwork route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Artwork())
})

//Add artwork route (edit: got rid of param upload.single('image'))
router.post('/', async (req, res) => { //The library multer does the work of putting the file in the correct folder for us
    //const fileName = req.file != null ? req.file.filename : null //Get file name if it exists
    //Create new Artwork object
    const artwork = new Artwork({
        title: req.body.title,
        author: req.body.author,
        createdAt: new Date(req.body.createdAt),
        //image: fileName,
        content: req.body.content,
        theme: req.body.theme,
        tags: JSON.stringify(req.body.tags).replace(/]|[[]/g, '').replace(/\"/g, "").split(",")
    })

    saveImage(artwork, req.body.image)

    //Save artwork
    try {
        const newArtwork = await artwork.save()
        res.redirect(`artworks/${newArtwork.id}`)
    } catch {
        /*if(artwork.image != null){
            removeArtworkImage(artwork.image)
        }*/
        renderNewPage(res, artwork, true)
    }
})

//Show info
router.get('/:id', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id)
            .populate('author').exec() //populate makes the id the full object
        res.render('artworks/show', { artwork: artwork })
    } catch {
        res.redirect('/')
    }
})

//Edit Artwork figcaption
router.get('/:id/edit', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id)
        renderEditPage(res, artwork)
    } catch {
        res.redirect('/')
    }
})

//Update artwork route 
router.put('/:id', async (req, res) => {
    let artwork
    //Save artwork
    try {
        artwork = await Artwork.findById(req.params.id)
        artwork.title = req.body.title
        artwork.author = req.body.author
        artwork.createdAt = new Date(req.body.createdAt)
        artwork.content = req.body.content
        artwork.theme = req.body.theme
        artwork.tags = JSON.stringify(req.body.tags).replace(/]|[[]/g, '').replace(/\"/g, "").split(",")
        if (req.body.image != null && req.body.image !== '') {
            saveImage(artwork, req.body.image)
        } //The default is null, we don't want to delete the cover
        await artwork.save()
        res.redirect(`/artworks/${artwork.id}`)
    } catch {
        if (artwork != null) {
            renderEditPage(res, artwork, true)
        } else {
            res.redirect('/')
        }
    }
})

router.delete('/:id', async (req, res) => {
    let artwork
    try {
        artwork = await Artwork.findById(req.params.id)
        //TODO: use fs unlink path to image to remove image 
        await artwork.remove()
        res.redirect('/artworks')
    } catch {
        if (artworks != null) //If the artwork exist
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

//Show error to dev (edit: no need to remove from file system if we upload image to db)
/*function removeArtworkImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}*/

async function renderNewPage(res, artwork, hasError = false) { //res to render/redirect, artwork = new or existing one
    renderFormPage(res, artwork, 'new', hasError)
}

async function renderEditPage(res, artwork, hasError = false) {
    renderFormPage(res, artwork, 'edit', hasError)
}

//Optimization to avoid duplicating code for New/Edit
async function renderFormPage(res, artwork, form, hasError = false) { //res to render/redirect, artwork = new or existing one
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            artwork: artwork

        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Editing Artwork'
            } else {
                params.errorMessage = 'Error Creating Artwork'
            }
        }
        res.render(`artworks/${form}`, params)
    } catch {
        res.redirect('/artworks')
    }
    //res.render("artwork/new", { artwork: new Artwork() })
}

function saveImage(artwork, imageEncode) {
    //Is it valid?
    if (imageEncode == null) return
    const image = JSON.parse(imageEncode)
    if (image != null && imageMimeTypes.includes(image.type)) {
        artwork.image = new Buffer.from(image.data, 'base64')
        artwork.imageType = image.type
    }
}

///PAGINATION
function paginationResults(model) {
    return async (req, res, next) => {

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        var title = req.query.title
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        //title: { $regex: /^title/i}
        let count = await model.find({ title: { $regex: title }}).countDocuments()
        if (title == '' || title == null) {
            count = await model.find().countDocuments()
        }

        const results = {}
        if (endIndex < count) {
            results.next = {
                page: page + 1,
                limit: limit,
                title: title
            }
        }

        if (startIndex > 0) { //Check if we're at page 1
            results.previous = {
                page: page - 1,
                limit: limit,
                title: title
            }
        }

        try {
            /*results.results = await model.find().sort({
                createdAt: 'desc' //Top article = newest one
            }).limit(limit).skip(startIndex).exec()*/

            let query = model.find({ title: { $regex: title }}).sort({
                createdAt: 'desc' //Top article = newest one
            }).limit(limit).skip(startIndex)

            /*if (title != null && title != '') {
                query = query.regex('title', new RegExp(title, 'i'))
            }*/

            

            results.results = await query.exec()
            results.count = {
                count: Math.ceil(count/limit),
                limit: limit,
                title: title
            }

            res.paginationResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}
module.exports = router