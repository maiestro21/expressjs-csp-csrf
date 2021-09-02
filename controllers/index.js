var { randomBytes } = require('crypto');

exports.csp_test = (req, res) => {

   
    res.render("csp.ejs");

}


exports.csrf = (req, res) => {

    //CSRF
    if (req.session.csrf === undefined) {
        req.session.csrf = randomBytes(100).toString('base64'); // convert random data to a string
    }

    console.log(req.session.csrf);
    res.render("csrf.ejs", { token: req.session.csrf });

}

exports.csrf_post = (req, res) => {
    if (!req.body._csrf) {
        return res.send(`<p style="font-size: 4rem; color: red;">
                         <strong>CSRF Token not included.</strong>
                         </p>`);
    }

    if (req.body._csrf !== req.session.csrf) {
        return res.send(`<p style="font-size: 4rem; color: red;">
                         <strong>CSRF tokens do not match.</strong>
                         </p>`);
    }

    return res.send(`<p style="font-size: 4rem;">
                       <strong>Successful request!</strong>
                       </p>`);



}



