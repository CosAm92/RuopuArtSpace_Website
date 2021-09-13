//Middleware
const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    const token = req.body.token //|| req.headers.authorization.split(' ')[1]
    if(!token) return res.status(401).send('Access Denied')
    try{
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decode
    }
    catch(error){
        res.status(400).send('Invalid Token')
    }
    return next()
}

module.exports = auth