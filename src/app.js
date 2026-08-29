const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const config = require('./config');
const db = require('./db');
const { migrate } = require('./db/migrate');
const { seed } = require('./db/seed');
const { renderIcon, icons } = require('./utils/icons');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Global locals middleware (Available across all EJS templates)
app.use(async (req, res, next) => {
  try {
    let settingsObj = {
      store_name: config.store.name,
      store_phone: config.store.phone,
      store_whatsapp: config.store.whatsapp,
      store_address: config.store.address,
      store_hours: config.store.hours,
      google_maps_url: config.store.mapsUrl
    };

    if (!db.isUsingFallback()) {
      try {
        const sRes = await db.query('SELECT key, value FROM store_settings');
        sRes.rows.forEach(r => {
          settingsObj[r.key] = r.value;
        });
      } catch (err) {
        // use default settings
      }
    } else {
      settingsObj = { ...settingsObj, ...db.memoryStore.settings };
    }

    res.locals.settings = settingsObj;
    res.locals.currentPath = req.path;
    res.locals.currentYear = new Date().getFullYear();
    res.locals.isDbFallback = db.isUsingFallback();
    res.locals.icon = renderIcon;
    res.locals.availableIcons = Object.keys(icons);
    next();
  } catch (err) {
    next(err);
  }
});

// Mount Application Routes
app.use('/', require('./routes/index'));
app.use('/products', require('./routes/products'));
app.use('/reviews', require('./routes/reviews'));
app.use('/contact', require('./routes/contact'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// 404 Handler
app.use((req, res) => {
  res.status(404).render('products', {
    title: '404 — Page Not Found | Tech Talk Mobile',
    page: '404',
    categories: [],
    products: [],
    selectedCategory: 'all',
    searchQuery: '',
    selectedSort: 'featured',
    errorMsg: 'The requested page was not found. Please browse our product catalog below.'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).send(`
    <div style="font-family:sans-serif; text-align:center; padding:50px;">
      <h2>Something went wrong</h2>
      <p>${err.message}</p>
      <a href="/" style="color:#ff7a00; text-decoration:none; font-weight:bold;">Return to Home</a>
    </div>
  `);
});

// Server Initialization
const startServer = async () => {
  console.log('Initializing Tech Talk Mobile Web Application...');

  const isDbConnected = await db.checkConnection();
  if (isDbConnected) {
    try {
      console.log('Running database migrations...');
      await migrate();
      console.log('Checking seed data...');
      await seed();
    } catch (err) {
      console.error('DB Init warning (will continue):', err.message);
    }
  } else {
    console.log('Running with full mock store. All features (Inventory CRUD, WhatsApp, Leads, Reviews, Admin) are fully operational.');
  }

  app.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`Tech Talk Mobile Server running on: http://localhost:${config.port}`);
    console.log(`Location: AECS Layout, Brookefield, Bengaluru`);
    console.log(`Admin Dashboard: http://localhost:${config.port}/admin`);
    console.log(`Health API: http://localhost:${config.port}/api/health`);
    console.log(`======================================================\n`);
  });
};

startServer();

module.exports = app;
