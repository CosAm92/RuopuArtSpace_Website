const {ROLE} = require('../data')

function canCreateArticle(user, article){
    return (
        user.role === ROLE.ADMIN ||
        article.author === user.name //Change the db so that it works with IDs instead
    )
}

function canDeleteArticle(user, article){
    return (
        user.role === ROLE.ADMIN ||
        article.author === user.name //Change the db so that it works with IDs instead
    )
}

function scopedArticles(user, articles){
    if(user.role === ROLE.ADMIN) return articles
    return articles.filter(article => article.author === user.name) //same
}

module.exports = {
    canCreateArticle,
    canDeleteArticle,
    scopedArticles
}