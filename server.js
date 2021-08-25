const express = require('express')
const mongoose = require('mongoose')
//const expressLayouts = require('express-ejs-layouts')

const articleRouter = require('./routes/articles')
const app = express()
const port = 5001;

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser:true, //Get rid of deprecation warnings
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to DB'))

//const indexRouter = require('./routes/index')
//app.set('views', __dirname+'/views') //Where are views are coming from
//app.set('layout','layouts/layout') //No need to duplicated header/footer/duplicates HTML files
//app.use(expressLayouts)
//app.use(express.static('public')) //Public referes to public files (CSS/JS/images files)

app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:false})) //We can access the article new form through the router with req.body, needs to be before the app.use route

app.get('/', (req,res) =>{
    const articles = [{
        title: 'Article Title',
        author: 'Article author',
        createdAt: new Date(),
        updatedAt: new Date(),
        summary: 'Test summary/description',
        markdown: 'Content'
    }]
    res.render('articles/index', {articles: articles})
})

app.use('/articles', articleRouter) //Changes the route: we can look at articles in localhost:5001/articles/articleRouter

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

//app.use('/', indexRouter)
//app.listen(process.env.PORT || 3000) //The server tells the PORT used, we put it at 3000
