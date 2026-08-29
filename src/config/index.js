require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'techtalk_db',
    user: process.env.DB_USER || 'techtalk_user',
    password: process.env.DB_PASSWORD || 'techtalk_secure_password',
  },
  store: {
    name: process.env.STORE_NAME || 'Tech Talk Mobile',
    phone: process.env.STORE_PHONE || '+919876543210',
    whatsapp: process.env.STORE_WHATSAPP || '919876543210',
    address: process.env.STORE_ADDRESS || 'Opposite Kanti Sweets, B Block, AECS Layout, Brookefield, Bengaluru – 560037',
    hours: process.env.STORE_HOURS || 'Mon – Sat · 9:00 AM – 8:00 PM',
    mapsUrl: process.env.GOOGLE_MAPS_URL || 'https://maps.google.com/?q=AECS+Layout+Brookefield+Bengaluru+opposite+Kanti+Sweets',
  },
  adminSecret: process.env.ADMIN_SECRET || 'admin123'
};
