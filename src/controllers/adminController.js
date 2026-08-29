const db = require('../db');

exports.getDashboard = async (req, res) => {
  try {
    let stats = { products: 20, categories: 8, reviews: 5, inquiries: 0 };
    let recentInquiries = [];
    let recentProducts = [];

    if (db.isUsingFallback()) {
      stats = {
        products: db.memoryStore.products.length,
        categories: db.memoryStore.categories.length,
        reviews: db.memoryStore.reviews.length,
        inquiries: db.memoryStore.inquiries.length
      };
      recentInquiries = db.memoryStore.inquiries.slice(-5).reverse();
      recentProducts = db.memoryStore.products.slice(-5).reverse();
    } else {
      const pCount = await db.query('SELECT COUNT(*) FROM products');
      const cCount = await db.query('SELECT COUNT(*) FROM categories');
      const rCount = await db.query('SELECT COUNT(*) FROM reviews');
      const iCount = await db.query('SELECT COUNT(*) FROM inquiries');
      const inqRes = await db.query('SELECT * FROM inquiries ORDER BY id DESC LIMIT 5');
      const prodRes = await db.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.id DESC LIMIT 5
      `);

      stats = {
        products: parseInt(pCount.rows[0].count, 10),
        categories: parseInt(cCount.rows[0].count, 10),
        reviews: parseInt(rCount.rows[0].count, 10),
        inquiries: parseInt(iCount.rows[0].count, 10)
      };
      recentInquiries = inqRes.rows;
      recentProducts = prodRes.rows;
    }

    res.render('admin/index', {
      title: 'Admin Dashboard — Tech Talk Mobile',
      page: 'admin',
      stats,
      recentInquiries,
      recentProducts,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.render('admin/index', {
      title: 'Admin Dashboard',
      page: 'admin',
      stats: { products: 0, categories: 0, reviews: 0, inquiries: 0 },
      recentInquiries: [],
      recentProducts: [],
      successMsg: null
    });
  }
};

// ----------------------------------------------------
// Products Management
// ----------------------------------------------------
exports.getProducts = async (req, res) => {
  try {
    let products = [];
    if (db.isUsingFallback()) {
      products = [...db.memoryStore.products].reverse();
    } else {
      const resData = await db.query(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
      `);
      products = resData.rows;
    }

    res.render('admin/products', {
      title: 'Manage Products — Admin',
      page: 'admin',
      products,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error loading products list:', error);
    res.redirect('/admin');
  }
};

exports.getNewProductForm = async (req, res) => {
  try {
    const catRes = await db.query('SELECT * FROM categories ORDER BY display_order ASC');
    res.render('admin/product-form', {
      title: 'Add New Product — Admin',
      page: 'admin',
      categories: catRes.rows,
      product: null
    });
  } catch (error) {
    console.error('Error opening product form:', error);
    res.redirect('/admin/products');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category_id, description, price, original_price, badge, in_stock, is_featured, image_url, spec_keys, spec_values, raw_specs } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    let specs = {};
    if (spec_keys && spec_values) {
      const keys = Array.isArray(spec_keys) ? spec_keys : [spec_keys];
      const vals = Array.isArray(spec_values) ? spec_values : [spec_values];
      keys.forEach((k, idx) => {
        if (k && k.trim()) {
          specs[k.trim()] = (vals[idx] || '').trim();
        }
      });
    } else if (raw_specs && raw_specs.trim()) {
      try {
        specs = JSON.parse(raw_specs);
      } catch (e) {
        specs = { details: raw_specs };
      }
    }

    const catId = parseInt(category_id, 10);
    const inStockBool = in_stock === 'on' || in_stock === 'true' || in_stock === true;
    const isFeaturedBool = is_featured === 'on' || is_featured === 'true' || is_featured === true;
    const img = image_url && image_url.trim() ? image_url.trim() : 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80';

    if (db.isUsingFallback()) {
      const cat = db.memoryStore.categories.find(c => c.id === catId);
      const newProd = {
        id: db.memoryStore.products.length + 1,
        category_id: catId,
        category_name: cat ? cat.name : 'Accessories',
        category_slug: cat ? cat.slug : 'accessories',
        name: name.trim(),
        slug,
        description: description ? description.trim() : '',
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        badge: badge ? badge.trim() : null,
        in_stock: inStockBool,
        is_featured: isFeaturedBool,
        image_url: img,
        specs
      };
      db.memoryStore.products.push(newProd);
    } else {
      await db.query(
        `INSERT INTO products (category_id, name, slug, description, price, original_price, badge, in_stock, is_featured, image_url, specs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          catId,
          name.trim(),
          slug,
          description ? description.trim() : '',
          parseFloat(price),
          original_price ? parseFloat(original_price) : null,
          badge ? badge.trim() : null,
          inStockBool,
          isFeaturedBool,
          img,
          JSON.stringify(specs)
        ]
      );
    }

    res.redirect('/admin/products?msg=Product+created+successfully');
  } catch (error) {
    console.error('Error creating product:', error);
    res.redirect('/admin/products?msg=Error+creating+product');
  }
};

exports.getEditProductForm = async (req, res) => {
  try {
    const { id } = req.params;
    const catRes = await db.query('SELECT * FROM categories ORDER BY display_order ASC');
    let product = null;

    if (db.isUsingFallback()) {
      product = db.memoryStore.products.find(p => p.id === parseInt(id, 10));
    } else {
      const prodRes = await db.query('SELECT * FROM products WHERE id = $1', [id]);
      product = prodRes.rows[0];
    }

    if (!product) return res.redirect('/admin/products');

    res.render('admin/product-form', {
      title: `Edit ${product.name} — Admin`,
      page: 'admin',
      categories: catRes.rows,
      product
    });
  } catch (error) {
    console.error('Error loading product for edit:', error);
    res.redirect('/admin/products');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, description, price, original_price, badge, in_stock, is_featured, image_url, spec_keys, spec_values, raw_specs } = req.body;

    let specs = {};
    if (spec_keys && spec_values) {
      const keys = Array.isArray(spec_keys) ? spec_keys : [spec_keys];
      const vals = Array.isArray(spec_values) ? spec_values : [spec_values];
      keys.forEach((k, idx) => {
        if (k && k.trim()) {
          specs[k.trim()] = (vals[idx] || '').trim();
        }
      });
    } else if (raw_specs && raw_specs.trim()) {
      try {
        specs = JSON.parse(raw_specs);
      } catch (e) {
        specs = { details: raw_specs };
      }
    }

    const catId = parseInt(category_id, 10);
    const inStockBool = in_stock === 'on' || in_stock === 'true' || in_stock === true;
    const isFeaturedBool = is_featured === 'on' || is_featured === 'true' || is_featured === true;

    if (db.isUsingFallback()) {
      const prod = db.memoryStore.products.find(p => p.id === parseInt(id, 10));
      if (prod) {
        const cat = db.memoryStore.categories.find(c => c.id === catId);
        prod.name = name.trim();
        prod.category_id = catId;
        prod.category_name = cat ? cat.name : prod.category_name;
        prod.category_slug = cat ? cat.slug : prod.category_slug;
        prod.description = description ? description.trim() : '';
        prod.price = parseFloat(price);
        prod.original_price = original_price ? parseFloat(original_price) : null;
        prod.badge = badge ? badge.trim() : null;
        prod.in_stock = inStockBool;
        prod.is_featured = isFeaturedBool;
        prod.image_url = image_url;
        prod.specs = specs;
      }
    } else {
      await db.query(
        `UPDATE products
         SET category_id = $1, name = $2, description = $3, price = $4, original_price = $5, badge = $6, in_stock = $7, is_featured = $8, image_url = $9, specs = $10
         WHERE id = $11`,
        [
          catId,
          name.trim(),
          description ? description.trim() : '',
          parseFloat(price),
          original_price ? parseFloat(original_price) : null,
          badge ? badge.trim() : null,
          inStockBool,
          isFeaturedBool,
          image_url,
          JSON.stringify(specs),
          id
        ]
      );
    }

    res.redirect('/admin/products?msg=Product+updated+successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    res.redirect('/admin/products?msg=Error+updating+product');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isUsingFallback()) {
      db.memoryStore.products = db.memoryStore.products.filter(p => p.id !== parseInt(id, 10));
    } else {
      await db.query('DELETE FROM products WHERE id = $1', [id]);
    }
    res.redirect('/admin/products?msg=Product+deleted+successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.redirect('/admin/products?msg=Error+deleting+product');
  }
};

exports.toggleProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isUsingFallback()) {
      const prod = db.memoryStore.products.find(p => p.id === parseInt(id, 10));
      if (prod) prod.in_stock = !prod.in_stock;
    } else {
      await db.query('UPDATE products SET in_stock = NOT in_stock WHERE id = $1', [id]);
    }
    res.redirect('/admin/products?msg=Stock+status+updated');
  } catch (error) {
    console.error('Error toggling product stock:', error);
    res.redirect('/admin/products');
  }
};

// ----------------------------------------------------
// Categories Management
// ----------------------------------------------------
exports.getCategories = async (req, res) => {
  try {
    let categories = [];
    if (db.isUsingFallback()) {
      categories = [...db.memoryStore.categories].sort((a, b) => a.display_order - b.display_order);
    } else {
      const catRes = await db.query('SELECT * FROM categories ORDER BY display_order ASC');
      categories = catRes.rows;
    }

    res.render('admin/categories', {
      title: 'Manage Categories — Admin',
      page: 'admin',
      categories,
      editCategory: null,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.redirect('/admin');
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description, image_url, display_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cleanIcon = icon && icon.trim() ? icon.trim() : 'smartphone';

    if (db.isUsingFallback()) {
      const newCat = {
        id: db.memoryStore.categories.length + 1,
        name: name.trim(),
        slug,
        icon: cleanIcon,
        description: description ? description.trim() : '',
        image_url: image_url || 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
        display_order: parseInt(display_order, 10) || 10
      };
      db.memoryStore.categories.push(newCat);
    } else {
      await db.query(
        `INSERT INTO categories (name, slug, icon, description, image_url, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name.trim(), slug, cleanIcon, description ? description.trim() : '', image_url, parseInt(display_order, 10) || 10]
      );
    }

    res.redirect('/admin/categories?msg=Category+added+successfully');
  } catch (error) {
    console.error('Error creating category:', error);
    res.redirect('/admin/categories?msg=Error+creating+category');
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const catId = parseInt(id, 10);
    if (db.isUsingFallback()) {
      db.memoryStore.categories = db.memoryStore.categories.filter(c => c.id !== catId);
    } else {
      await db.query('DELETE FROM categories WHERE id = $1', [catId]);
    }
    res.redirect('/admin/categories?msg=Category+deleted+successfully');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.redirect('/admin/categories?msg=Error+deleting+category');
  }
};

// ----------------------------------------------------
// Inquiries & Leads Management
// ----------------------------------------------------
exports.getInquiries = async (req, res) => {
  try {
    let inquiries = [];
    if (db.isUsingFallback()) {
      inquiries = [...db.memoryStore.inquiries].reverse();
    } else {
      const inqRes = await db.query('SELECT * FROM inquiries ORDER BY id DESC');
      inquiries = inqRes.rows;
    }

    res.render('admin/inquiries', {
      title: 'Customer Inquiries and Leads — Admin',
      page: 'admin',
      inquiries,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error loading inquiries:', error);
    res.redirect('/admin');
  }
};

exports.toggleInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isUsingFallback()) {
      const inq = db.memoryStore.inquiries.find(i => i.id === parseInt(id, 10));
      if (inq) inq.status = inq.status === 'resolved' ? 'pending' : 'resolved';
    } else {
      await db.query(`UPDATE inquiries SET status = CASE WHEN status = 'resolved' THEN 'pending' ELSE 'resolved' END WHERE id = $1`, [id]);
    }
    res.redirect('/admin/inquiries?msg=Inquiry+status+updated');
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.redirect('/admin/inquiries');
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isUsingFallback()) {
      db.memoryStore.inquiries = db.memoryStore.inquiries.filter(i => i.id !== parseInt(id, 10));
    } else {
      await db.query('DELETE FROM inquiries WHERE id = $1', [id]);
    }
    res.redirect('/admin/inquiries?msg=Inquiry+deleted');
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.redirect('/admin/inquiries');
  }
};

// ----------------------------------------------------
// Reviews Management
// ----------------------------------------------------
exports.getReviews = async (req, res) => {
  try {
    let reviews = [];
    if (db.isUsingFallback()) {
      reviews = [...db.memoryStore.reviews].reverse();
    } else {
      const rRes = await db.query('SELECT * FROM reviews ORDER BY id DESC');
      reviews = rRes.rows;
    }

    res.render('admin/reviews', {
      title: 'Manage Customer Reviews — Admin',
      page: 'admin',
      reviews,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error loading reviews for admin:', error);
    res.redirect('/admin');
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isUsingFallback()) {
      db.memoryStore.reviews = db.memoryStore.reviews.filter(r => r.id !== parseInt(id, 10));
    } else {
      await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    }
    res.redirect('/admin/reviews?msg=Review+removed+successfully');
  } catch (error) {
    console.error('Error deleting review:', error);
    res.redirect('/admin/reviews');
  }
};

// ----------------------------------------------------
// Store Settings
// ----------------------------------------------------
exports.getSettings = async (req, res) => {
  try {
    let settingsObj = {};
    if (db.isUsingFallback()) {
      settingsObj = db.memoryStore.settings;
    } else {
      const setRes = await db.query('SELECT * FROM store_settings');
      setRes.rows.forEach(r => {
        settingsObj[r.key] = r.value;
      });
    }

    res.render('admin/settings', {
      title: 'Store Settings — Admin',
      page: 'admin',
      settings: settingsObj,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.redirect('/admin');
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { store_name, store_phone, store_whatsapp, store_address, store_hours, google_maps_url } = req.body;
    const updates = { store_name, store_phone, store_whatsapp, store_address, store_hours, google_maps_url };

    for (const [k, v] of Object.entries(updates)) {
      if (db.isUsingFallback()) {
        db.memoryStore.settings[k] = v;
      } else {
        await db.query(
          `INSERT INTO store_settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [k, v]
        );
      }
    }

    res.redirect('/admin/settings?msg=Store+settings+updated+successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    res.redirect('/admin/settings?msg=Error+saving+settings');
  }
};
