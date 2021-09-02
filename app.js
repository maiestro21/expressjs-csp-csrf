const express = require('express');
const session = require('express-session');
const { render } = require('ejs');
const { urlencoded } = require('express');
const path = require('path');
const EJS = require('ejs');
const expressModifyResponse = require('express-modify-response');
const helmet = require("helmet");
const crypto = require('crypto');
var cookieParser = require('cookie-parser')    //for cookie parsing
var cookieSession = require('cookie-session'); // require cookie session
const uuid = require('uuid');

app = express();

app.use('/assets', express.static('assets'));
app.use(urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());



app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    res.setHeader("Content-Security-Policy", `script-src 'nonce-${res.locals.cspNonce}' 'strict-dynamic' https://*.google-analytics.com; connect-src 'self' https://*.microsoftonline.com https://*.google-analytics.com https://*.hotjar.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.google-analytics.com https://fonts.gstatic.com https://*.linkedin.com https://*.google.com https://*.google.ro; default-src 'self'; frame-ancestors 'self' https://*.microsoft.com https://*.cookiebot.com;frame-src 'self' https://*.cookiebot.com https://*.hotjar.com;`);
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), fullscreen=(), microphone=()");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Powered-By", "SampleName");
    res.setHeader("X-Frame-Options", "sameorigin");
    next();
});

// app.use(
//     helmet.contentSecurityPolicy({
//         useDefaults: true,
//         directives: {
//             scriptSrc: [(req, res) => `'nonce-${res.locals.cspNonce}'`],
//         },
//     })
// );


app.use(expressModifyResponse(
    (req, res) => {
        // return true if you want to modify the response later
        if (res.getHeader('Content-Type')) {
            if (res.getHeader('Content-Type').includes('text/html')) {
                res.setHeader('Cache-Control', 'no-store');
                return true;
            }
        }
        return false;
    },
    (req, res, body) => {
        // body is a Buffer with the current response; return Buffer or string with the modified response
        // can also return a Promise.
        let newHTML = body.toString();
        newHTML = newHTML.replace(/<script/g, '<script nonce="' + res.locals.cspNonce + '"').replace(/<style/g, '<style nonce="' + res.locals.cspNonce + '"');
        return newHTML;
    }
));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// Session
var expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24); // 24 hours
app.set('trust proxy', 1);
// set up the cookie for the session
app.use(cookieSession({
    name: 'session',                              // name of the cookie
    secret: 'MAKE_THIS_SECRET_SECURE',            // key to encode session
    cookie: { expires: new Date(253402300000000) },               // cookie's lifespan
    sameSite: 'lax',                              // controls when cookies are sent
    path: '/',                                    // explicitly set this for security purposes
    // secure: process.env.NODE_ENV === 'production',// cookie only sent on HTTPS
    httpOnly: true                                // cookie is not available to JavaScript (client)
}));



//SESSION
app.use(session({
    secret: '/U%YE,hgl324dhbfdkjh%HDEW#@geseTYHgfw3',
    resave: false,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'SAMPLE-SESSION',
    genid: (req) => {
        // Returns a random string to be used as a session ID
    }
}));


app.use(function (req, res, next) {
    var cookie = req.cookies.uuid;
    if (cookie === undefined) {
        res.cookie('uuid', uuid.v4());
    }

    //UTM Marketing query data middleware
    if(Object.keys(req.query).length){
        req.session.utms = req.query;
    }
  
    next();
});




// Routers
let router = require('./routes/index')

app.use('/', router) // index router


app.listen(process.env.PORT || 8080);
