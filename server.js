if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config(); //parse and load are depreciated
}
//Only load in the environment variable if we're in production

const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')

const sessions = require('express-session')
const nodemailer = require('nodemailer')

const indexRouter = require('./routes/index')
//const customRouter = require('./routes/custom') //Erase custom router file, it's useless
const articleRouter = require('./routes/articles')
const authorRouter = require('./routes/authors')
const artworkRouter = require('./routes/artworks')
const userRouter = require('./routes/users')
const authRouter = require('./routes/auth')

const app = express()
const port = process.env.PORT || 5001;

//Connect to db and Get rid of deprecation warnings
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to DB'))

app.set('views', __dirname + '/views') //Where views are coming from
app.set('layout', 'layouts/layout') //No need to duplicated header/footer/duplicates HTML files
app.use(expressLayouts)
app.use(express.static('public')) //Public referes to public files (CSS/JS/images files)
app.set('view engine', 'ejs')

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })) //We can access the article new form through the router with req.body, needs to be before the app.use route, edit:  extended:false
app.use(methodOverride('_method')) //If we path _method we can do more that GET/POST

/*app.get('/', (req, res) => {
    res.render('index')
})*/
app.use(sessions({
    secret: process.env.ACCESS_TOKEN_SECRET,
    saveUninitialized: true,
    resave: false
}));

//No-cache for logged out users
app.use(function (req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// Middleware to make 'user' available to all .ejs templates
//Uses the server data put into session variable during login
app.use(function (req, res, next) {
    res.locals.userId = req.session.userId;
    res.locals.isAdmin = req.session.userIsAdmin;
    //res.locals.searchQuery = {}
    next();
});

app.use('/', indexRouter)
app.use('/articles', articleRouter) //Changes the route: we can look at articles in localhost:5001/articles/articleRouter
app.use('/authors', authorRouter)
app.use('/artworks', artworkRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.get('/custom', (req, res) => {
    res.render('custom');
});

//Contact
app.get('/contact', (req, res) => {
    res.render('contact')
})
app.post('/send', (req, res) => {
    const output = `
    <p> New message </p>
    <ul>
    <li>Email: ${req.body.email} </li>
    <li>Subject: ${req.body.subject} </li>
    <li>Message: ${req.body.message} </li>
    </ul>
    `;

    //Create reusable transporter object for our server using default SMTP transport
    let transporter = nodemailer.createTransport({
        // Send mail using qq
        // For more information, see the support list: https://nodemailer.com/smtp/well-known/
        //host: 'ruopu-art-space-pwa.herokuapp.com',
        //host: 'smtp.qq.com',
        service: 'gmail', //'qq'
        host: 'smtp.gmail.com',
        //Port: 465, // SMTP port 465 for qq
        SeceConnection: false, // using SSL, true only for 465 port/qq
        auth: {
            user: 'amanda.dieuaide@gmail.com',
            // The password here is not a QQ password. It's the SMTP authorization code you set up.
            pass: process.env.SMTP,
        },
        tls: {
            rejectUnauthorized: false //Enabling from localhost
        }
    });

    let mailOptions = {
        from: '"Nodemailer Contact" <amanda.dieuaide@gmail.com>', //You go to QQ mailbox address
        to: 'amanda.dieuaide@gmail.com', //Receiver, can fill in multiple comma separations in groups
        subject: 'Node Contact Test', // Subject Name (Mail Name)
        // You can send text or HTML format, 2 chooses 1
        // Text:'Hello world?', // plain text
        html: output // html
    };

    // Execute Send
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log(`Message: ${info.messageId}`);
        console.log(`Sent: ${info.response}`);
        res.render('contact')
        //res.render('contact', { msg: 'Email has been sent' })
    });
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

//app.use('/', indexRouter)
//app.listen(process.env.PORT || 3000) //The server tells the PORT used, we put it at 3000
