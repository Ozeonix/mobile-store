const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.getReviewsPage);
router.post('/', reviewController.submitReview);

module.exports = router;
