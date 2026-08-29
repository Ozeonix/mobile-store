const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/', adminController.getDashboard);

// Products CRUD
router.get('/products', adminController.getProducts);
router.get('/products/new', adminController.getNewProductForm);
router.post('/products/new', adminController.createProduct);
router.get('/products/edit/:id', adminController.getEditProductForm);
router.post('/products/edit/:id', adminController.updateProduct);
router.post('/products/delete/:id', adminController.deleteProduct);
router.post('/products/:id/toggle-stock', adminController.toggleProductStock);

// Categories CRUD
router.get('/categories', adminController.getCategories);
router.post('/categories/new', adminController.createCategory);
router.post('/categories/delete/:id', adminController.deleteCategory);

// Inquiries / Leads CRUD
router.get('/inquiries', adminController.getInquiries);
router.post('/inquiries/:id/toggle', adminController.toggleInquiryStatus);
router.post('/inquiries/delete/:id', adminController.deleteInquiry);

// Reviews Management
router.get('/reviews', adminController.getReviews);
router.post('/reviews/delete/:id', adminController.deleteReview);

// Store Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

module.exports = router;
