//Middleware to check if user is logged in
function authUser(req, res, next){
    if(req.user == null){
        res.status(403) //Not logged
        return res.send('You are not logged.')
    }
    next()
}

function authRole(role){
    return(req,res,next) => {
        if (req.user.role === role){
            res.status(401) //No access
            return res.send('You cannot access this.')
        }
    }
}

module.exports = { authUser, authRole }