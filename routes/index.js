const express = require('express')
const router = express.Router();

// the indexController
const indexController = require('../controllers/index')


router.get('/', indexController.csp_test);
router.get('/csrf/', indexController.csrf);
router.post('/csrf/post', indexController.csrf_post);



module.exports = router