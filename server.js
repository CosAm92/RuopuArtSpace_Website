if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config(); //parse and load are depreciated
}
//Only load in the environment variable if we're in production

const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')
const articleRouter = require('./routes/articles')
const authorRouter = require('./routes/authors')
const artworkRouter = require('./routes/artworks')

const app = express()
const port = process.env.PORT || 5001;//5001

//Connect to db and Get rid of deprecation warnings
mongoose.connect(process.env.DATABASE_URL, { 
    useNewUrlParser:true, 
    useUnifiedTopology: true,
    useCreateIndex: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to DB'))

app.set('views', __dirname+'/views') //Where views are coming from
app.set('layout','layouts/layout') //No need to duplicated header/footer/duplicates HTML files
app.use(expressLayouts)
app.use(express.static('public')) //Public referes to public files (CSS/JS/images files)
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:false})) //We can access the article new form through the router with req.body, needs to be before the app.use route
app.use(methodOverride('_method')) //If we path _method we can do more that GET/POST

/*app.get('/', (req, res) => {
    res.render('index')
})*/

app.use('/', indexRouter)
app.use('/articles', articleRouter) //Changes the route: we can look at articles in localhost:5001/articles/articleRouter
app.use('/authors', authorRouter)
app.use('/artworks', artworkRouter)

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

//app.use('/', indexRouter)
//app.listen(process.env.PORT || 3000) //The server tells the PORT used, we put it at 3000
