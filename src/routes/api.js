const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/health', apiController.getHealth);
router.get('/products', apiController.getProductsApi);
router.get('/categories', apiController.getCategoriesApi);

module.exports = router;
