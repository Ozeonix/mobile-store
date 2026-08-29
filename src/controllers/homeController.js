const db = require('../db');

exports.getHomePage = async (req, res) => {
  try {
    const categoriesResult = await db.query('SELECT * FROM categories ORDER BY display_order ASC');
    const featuredProductsResult = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true
      ORDER BY p.id ASC
      LIMIT 8
    `);
    const reviewsResult = await db.query('SELECT * FROM reviews ORDER BY id DESC LIMIT 6');

    res.render('home', {
      title: 'Tech Talk Mobile — Premium Mobile Accessories in AECS Layout, Brookefield',
      page: 'home',
      categories: categoriesResult.rows,
      featuredProducts: featuredProductsResult.rows,
      reviews: reviewsResult.rows,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('home', {
      title: 'Tech Talk Mobile',
      page: 'home',
      categories: [],
      featuredProducts: [],
      reviews: [],
      successMsg: null,
      errorMsg: 'Could not load data. Please refresh.'
    });
  }
};
