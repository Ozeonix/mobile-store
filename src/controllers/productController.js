const db = require('../db');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, q, sort } = req.query;
    const categoriesResult = await db.query('SELECT * FROM categories ORDER BY display_order ASC');

    let queryText = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      queryText += ` AND c.slug = $${params.length}`;
    }

    if (q && q.trim()) {
      params.push(`%${q.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
    }

    if (sort === 'price_asc') {
      queryText += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      queryText += ` ORDER BY p.price DESC`;
    } else if (sort === 'newest') {
      queryText += ` ORDER BY p.id DESC`;
    } else {
      queryText += ` ORDER BY p.is_featured DESC, p.id ASC`;
    }

    let products = [];
    if (db.isUsingFallback()) {
      let list = [...db.memoryStore.products];
      if (category && category !== 'all') {
        list = list.filter(p => p.category_slug === category);
      }
      if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
      }
      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else if (sort === 'newest') list.sort((a, b) => b.id - a.id);
      products = list;
    } else {
      const prodResult = await db.query(queryText, params);
      products = prodResult.rows;
    }

    res.render('products', {
      title: 'Mobile Accessories Catalog — Tech Talk Mobile',
      page: 'products',
      categories: categoriesResult.rows,
      products,
      selectedCategory: category || 'all',
      searchQuery: q || '',
      selectedSort: sort || 'featured'
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).render('products', {
      title: 'Products — Tech Talk Mobile',
      page: 'products',
      categories: [],
      products: [],
      selectedCategory: 'all',
      searchQuery: '',
      selectedSort: 'featured',
      errorMsg: 'Could not load products. Please try again.'
    });
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const { identifier } = req.params;
    let product = null;

    if (db.isUsingFallback()) {
      product = db.memoryStore.products.find(p => p.slug === identifier || p.id === parseInt(identifier, 10));
    } else {
      const isNum = !isNaN(identifier);
      const queryText = isNum
        ? `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`
        : `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1`;
      const result = await db.query(queryText, [identifier]);
      product = result.rows[0];
    }

    if (!product) {
      return res.status(404).render('products', {
        title: 'Product Not Found — Tech Talk Mobile',
        page: 'products',
        categories: [],
        products: [],
        selectedCategory: 'all',
        searchQuery: '',
        selectedSort: 'featured',
        errorMsg: 'The requested product was not found.'
      });
    }

    // Related products in the same category
    let related = [];
    if (db.isUsingFallback()) {
      related = db.memoryStore.products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);
    } else {
      const relatedRes = await db.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = $1 AND p.id != $2 LIMIT 4`,
        [product.category_id, product.id]
      );
      related = relatedRes.rows;
    }

    res.render('product-detail', {
      title: `${product.name} — Tech Talk Mobile Bangalore`,
      page: 'products',
      product,
      relatedProducts: related
    });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    res.redirect('/products');
  }
};

exports.getCategoryHub = async (req, res) => {
  try {
    const { slug } = req.params;
    let category = null;
    let products = [];

    if (db.isUsingFallback()) {
      category = db.memoryStore.categories.find(c => c.slug === slug);
      if (category) {
        products = db.memoryStore.products.filter(p => p.category_slug === slug || p.category_id === category.id);
      }
    } else {
      const catRes = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
      category = catRes.rows[0];
      if (category) {
        const prodRes = await db.query(
          `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = $1 ORDER BY p.is_featured DESC, p.id ASC`,
          [category.id]
        );
        products = prodRes.rows;
      }
    }

    if (!category) {
      return res.redirect('/products');
    }

    res.render('category', {
      title: `${category.name} in AECS Layout, Brookefield — Tech Talk Mobile`,
      page: 'categories',
      category,
      products
    });
  } catch (error) {
    console.error('Error fetching category hub:', error);
    res.redirect('/products');
  }
};
