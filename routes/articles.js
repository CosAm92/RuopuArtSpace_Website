const express = require('express') //Import librairy
const router = express.Router() //Gives us a router to create views

router.get('/test', (req,res) => {
    res.send('Typical article page') //Simple request right?
})

module.exports = router //We can read this router everywhere