//Check if user is logged
function setUser(req, res, next){
    const userId = req.body.userId
    if(userId){
        req.user = users.find(user => user._id === userId)
    }
    next()
}

//Middleware to check if user exist and is logged
function authUser(req, res, next){
    session=req.session;
    if(session.userId == null){
        res.status(403) //doesn't exist
        return res.send('You need to log in')
    }
    next()
}

//check is user is admin
function authAdmin(req, res, next){
    session=req.session;
    if(session.userIsAdmin === false){
        res.status(403) //doesn't exist
        return res.send('Not Admin')
    }
    next()
}

module.exports = {
    setUser,
    authUser,
    authAdmin
}