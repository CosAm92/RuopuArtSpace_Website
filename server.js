
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const port = 3000

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname+'/views') //Where are views are coming from
app.set('layout','layouts/layout') //No need to duplicated header/footer/duplicates HTML files
app.use(expressLayouts)
app.use(express.static('public')) //Public referes to public files (CSS/JS/images files)

app.use('/', indexRouter)
//app.listen(process.env.PORT || 3000) //The server tells the PORT used, we put it at 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })