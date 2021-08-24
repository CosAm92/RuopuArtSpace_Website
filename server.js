const express = require('express');
//const expressLayouts = require('express-ejs-layouts')

const articleRouter = require('./routes/articles');
const app = express();
const port = 5001;

//const indexRouter = require('./routes/index')
//app.set('views', __dirname+'/views') //Where are views are coming from
//app.set('layout','layouts/layout') //No need to duplicated header/footer/duplicates HTML files
//app.use(expressLayouts)
//app.use(express.static('public')) //Public referes to public files (CSS/JS/images files)

app.set('view engine', 'ejs')

app.use('/articles', articleRouter) //Changes the route: we can look at articles in localhost:5001/articles/articleRouter

app.get('/', (req,res) =>{
    res.render('index', {text: 'articles'})
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

//app.use('/', indexRouter)
//app.listen(process.env.PORT || 3000) //The server tells the PORT used, we put it at 3000
