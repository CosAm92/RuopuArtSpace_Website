const express = require('express') //Import librairy
const router = express.Router() //Gives us a router to create views
const Author = require('../models/author')

//Show all authors
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i') // i regex = case insesitive Maj || min
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors: authors,
            searchOptions: req.query
         })
    } catch {
        res.redirect('/')
    }
})

//New author route
router.get('/new', (req, res) => {
    res.render("authors/new", { author: new Author() })
})

//Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()
        res.redirect('authors')
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }

    /*Equivalent to:
    author.save((err, newAuthor) => {
        if(err){
            res.render('authors/new', {
                author: author,
                errorMessage: 'Error creating Author'
            })
        } else{
            //res.redirect(`authors/${newAuthor.id}`)
            res.redirect('authors')
        }
    })*/

})
//Explicit which parameter we accept from the client since they can add the name they want
//More secure thant a simple res.send(req.body.name)

router.get('/:id', (req,res)=>{
    res.send('Show Author' + req.params.id)
})

router.get('/:id/edit', async (req,res)=>{
    try{
        const author = await Author.findById(req.params.id)
        res.render("authors/edit", { author: author })
    } catch {
        res.redirect('/authors')
    }  
})

router.put('/:id', async (req,res)=>{
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if(author == null){
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }
    }
})

router.delete('/:id', async (req,res)=>{
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch {
        if(author == null){
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router