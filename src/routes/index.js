const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const productController = require('../controllers/productController');

router.get('/', homeController.getHomePage);
router.get('/category/:slug', productController.getCategoryHub);

module.exports = router;
