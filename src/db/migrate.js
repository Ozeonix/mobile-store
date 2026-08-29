const { pool } = require('./index');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'smartphone',
        image_url TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;`);
    await client.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'smartphone';`);
    await client.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;`);

    // Create Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2),
        badge VARCHAR(50) DEFAULT NULL,
        in_stock BOOLEAN DEFAULT TRUE,
        image_url TEXT,
        specs JSONB DEFAULT '{}',
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT NULL;`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}';`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;`);

    try { await client.query(`ALTER TABLE products ALTER COLUMN brand DROP NOT NULL;`); } catch (e) {}
    try { await client.query(`ALTER TABLE products ALTER COLUMN model_compatibility DROP NOT NULL;`); } catch (e) {}
    try { await client.query(`ALTER TABLE products ALTER COLUMN image_emoji DROP NOT NULL;`); } catch (e) {}
    try { await client.query(`ALTER TABLE categories ALTER COLUMN sort_order DROP NOT NULL;`); } catch (e) {}

    // Create Reviews Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(150),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        source VARCHAR(50) DEFAULT 'Google Review',
        review_date VARCHAR(50) DEFAULT 'Recent',
        is_verified BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name VARCHAR(150);`);
    await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'Google Review';`);
    await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_date VARCHAR(50) DEFAULT 'Recent';`);
    await client.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;`);
    try { await client.query(`ALTER TABLE reviews ALTER COLUMN customer_name DROP NOT NULL;`); } catch (e) {}
    try { await client.query(`UPDATE reviews SET author_name = customer_name WHERE author_name IS NULL AND customer_name IS NOT NULL;`); } catch (e) {}

    // Create Inquiries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        product_name VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);`);
    await client.query(`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';`);

    // Create Store Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database migration and schema verification completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { migrate };
