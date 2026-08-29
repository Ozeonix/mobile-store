const db = require('../db');

exports.getHealth = async (req, res) => {
  try {
    const isFallback = db.isUsingFallback();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: isFallback ? 'in-memory-fallback' : 'postgresql-connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
};

exports.getProductsApi = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoriesApi = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY display_order ASC');
    res.json({ count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
