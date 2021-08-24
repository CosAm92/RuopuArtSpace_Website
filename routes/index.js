const express = required('express') //Import librairy
const router = express.Router()

router.get('/', (req,res) => {
    res.send('Hello World') //Simple request right?
})

module.exports = router