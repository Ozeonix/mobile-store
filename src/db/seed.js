const { pool } = require('./index');
const config = require('../config');

const seed = async (force = false) => {
  const client = await pool.connect();
  try {
    if (!force) {
      const catCheck = await client.query('SELECT COUNT(*) FROM categories');
      const prodCheck = await client.query('SELECT COUNT(*) FROM products');
      if (parseInt(catCheck.rows[0].count, 10) >= 8 && parseInt(prodCheck.rows[0].count, 10) >= 20) {
        console.log('Database already fully seeded with accessories.');
        return;
      }
    }

    await client.query('BEGIN');

    // Clean existing tables for fresh, high-quality seed
    await client.query('TRUNCATE TABLE products, categories, reviews, inquiries, store_settings RESTART IDENTITY CASCADE;');

    // 1. Seed Categories with Generated Local PNG Images & Embedded SVG Icon keys
    const categories = [
      { name: 'Screen Protectors', slug: 'screen-protectors', icon: 'shield', description: 'Edge-to-edge 11D tempered glass, matte privacy and UV curved protectors.', order: 1, image: '/images/tempered-glass.png' },
      { name: 'Cases and Covers', slug: 'cases-covers', icon: 'smartphone', description: 'MagSafe, rugged armor, liquid silicone and luxury leather cases.', order: 2, image: '/images/magsafe-case.png' },
      { name: 'Fast Chargers', slug: 'fast-chargers', icon: 'zap', description: 'GaN 65W/100W PD adapters, wireless charging stations and car plugs.', order: 3, image: '/images/gan-charger.png' },
      { name: 'Audio and TWS', slug: 'audio-tws', icon: 'headphones', description: 'Active Noise Cancelling earbuds, Bluetooth neckbands and studio audio.', order: 4, image: '/images/tws-earbuds.png' },
      { name: 'Power Banks', slug: 'power-banks', icon: 'battery', description: '10,000mAh to 30,000mAh fast-charging portable power banks.', order: 5, image: '/images/power-bank.png' },
      { name: 'Car Accessories', slug: 'car-accessories', icon: 'car', description: 'Magnetic dashboard mounts, wireless charging car clamps and audio adapters.', order: 6, image: '/images/car-mount.png' },
      { name: 'Cables and Adapters', slug: 'cables-adapters', icon: 'cable', description: 'Braided Type-C to Type-C, Lightning, OTG and durable fast charging cables.', order: 7, image: '/images/braided-cable.png' },
      { name: 'Smart Accessories', slug: 'smart-accessories', icon: 'watch', description: 'Smartwatch straps, camera lens protectors, ring holders and desktop stands.', order: 8, image: '/images/smart-strap.png' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description, icon, image_url, display_order)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, slug`,
        [cat.name, cat.slug, cat.description, cat.icon, cat.image, cat.order]
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 2. Seed Full Accessories Inventory with Local Generated PNG Images (20 Items)
    const products = [
      {
        name: '11D Curved Edge Tempered Glass',
        slug: '11d-curved-edge-tempered-glass',
        category_slug: 'screen-protectors',
        description: 'Ultra-tough 9H hardness tempered glass with 11D curved edge finish. Oleophobic nano-coating repels fingerprints, oils, and scratches. Free professional installation at our AECS Layout showroom.',
        price: 299,
        original_price: 599,
        badge: 'BESTSELLER',
        in_stock: true,
        image_url: '/images/tempered-glass.png',
        specs: { Hardness: '9H Sapphire Glass', Thickness: '0.33mm Ultra Thin', Compatibility: 'iPhone 13-16, Samsung S21-S24, OnePlus, Pixel', InBox: 'Glass, Wet Wipes, Microfiber Cloth, Dust Sticker' },
        is_featured: true
      },
      {
        name: 'Privacy Anti-Spy Matte Glass',
        slug: 'privacy-anti-spy-matte-glass',
        category_slug: 'screen-protectors',
        description: '28-degree micro-louver privacy filter prevents shoulder surfers from viewing your screen. Matte anti-glare finish blocks reflections in bright daylight.',
        price: 399,
        original_price: 799,
        badge: 'HOT',
        in_stock: true,
        image_url: '/images/tempered-glass.png',
        specs: { PrivacyAngle: '28 Degrees Viewing Angle', Coating: 'Anti-Glare Matte Oleophobic', TouchSensitivity: 'High Precision Gaming Ready' },
        is_featured: true
      },
      {
        name: 'UV Curved Liquid Glue Glass',
        slug: 'uv-curved-liquid-glue-glass',
        category_slug: 'screen-protectors',
        description: 'Specially engineered for curved display flagships. Optical clear liquid adhesive cured with UV light ensures zero edge bubbles and full in-display ultrasonic fingerprint unlock compatibility.',
        price: 599,
        original_price: 1199,
        badge: 'NEW',
        in_stock: true,
        image_url: '/images/tempered-glass.png',
        specs: { Technology: 'Liquid Optical UV Adhesive', FingerprintSupport: 'Ultrasonic In-Display Fast Unlock', Compatibility: 'Samsung S23/S24 Ultra, Vivo X100, OnePlus 12' },
        is_featured: false
      },
      {
        name: 'MagSafe Armor Translucent Case',
        slug: 'magsafe-armor-translucent-case',
        category_slug: 'cases-covers',
        description: 'Military-grade drop protection with integrated N52 strong neodymium magnets for super-fast MagSafe wireless charging. Frosted matte scratch-resistant backplate.',
        price: 499,
        original_price: 999,
        badge: 'BESTSELLER',
        in_stock: true,
        image_url: '/images/magsafe-case.png',
        specs: { DropTested: '10ft Military Standard', Magnets: '36x N52 Strong Array', Material: 'TPU Shock Bumper + Polycarbonate Back' },
        is_featured: true
      },
      {
        name: 'Liquid Silicone Soft Touch Cover',
        slug: 'liquid-silicone-soft-touch-cover',
        category_slug: 'cases-covers',
        description: 'Silky smooth premium liquid silicone with microfiber inner lining that prevents back glass micro-scratches. Raised camera bezel lip for lens protection.',
        price: 349,
        original_price: 699,
        badge: 'NEW',
        in_stock: true,
        image_url: '/images/magsafe-case.png',
        specs: { Material: 'Medical Grade Liquid Silicone', Lining: 'Microfiber Suede', Washable: 'Yes, Clean With Damp Cloth' },
        is_featured: false
      },
      {
        name: 'Heavy Duty 360 Kickstand Armor Case',
        slug: 'heavy-duty-360-kickstand-armor-case',
        category_slug: 'cases-covers',
        description: 'Dual layer rugged protective shell with zinc alloy 360-degree rotating ring kickstand and built-in sliding camera lens privacy cover.',
        price: 449,
        original_price: 899,
        badge: null,
        in_stock: true,
        image_url: '/images/magsafe-case.png',
        specs: { Kickstand: '360 Swivel Metal Ring', CameraProtection: 'Slide Shutter Guard', Compatibility: 'Redmi, Realme, Poco, Moto, Samsung A Series' },
        is_featured: false
      },
      {
        name: '65W GaN Dual Port Fast Adapter (Type-C + USB)',
        slug: '65w-gan-dual-port-fast-adapter',
        category_slug: 'fast-chargers',
        description: 'Gallium Nitride (GaN) III technology delivers full 65W Power Delivery in a pocket-sized form factor. Safely charge laptops, tablets, iPhone, Samsung Super Fast 2.0 and OnePlus devices.',
        price: 1299,
        original_price: 2499,
        badge: 'HOT',
        in_stock: true,
        image_url: '/images/gan-charger.png',
        specs: { Output: '65W Max (PD 3.0 + QC 4.0)', Ports: '1x Type-C + 1x USB-A', Protection: 'Overcurrent, Overheat, Short Circuit' },
        is_featured: true
      },
      {
        name: '20W PD Type-C Super Fast Adapter',
        slug: '20w-pd-type-c-super-fast-adapter',
        category_slug: 'fast-chargers',
        description: 'Charges your iPhone 0 to 50% in just 25 minutes. Compact, travel-friendly, BIS certified for Indian electrical standards with zero thermal throttling.',
        price: 499,
        original_price: 999,
        badge: 'SALE',
        in_stock: true,
        image_url: '/images/gan-charger.png',
        specs: { Power: '20W Power Delivery', Port: 'USB Type-C', Certification: 'BIS Certified Safety' },
        is_featured: false
      },
      {
        name: '3-in-1 Foldable Magnetic Wireless Charging Station',
        slug: '3-in-1-magnetic-wireless-charging-station',
        category_slug: 'fast-chargers',
        description: 'Simultaneously charges your smartphone (15W), smartwatch (2.5W), and wireless earbuds (5W) with intelligent device detection and fold-flat travel portability.',
        price: 1899,
        original_price: 3799,
        badge: 'NEW',
        in_stock: true,
        image_url: '/images/gan-charger.png',
        specs: { TotalOutput: '22.5W Max', WirelessStandards: 'Qi Certified + MagSafe Compatible', Folding: '180 Flat Compact Fold' },
        is_featured: true
      },
      {
        name: 'Pro ANC Wireless Earbuds (TWS)',
        slug: 'pro-anc-wireless-earbuds-tws',
        category_slug: 'audio-tws',
        description: '35dB Active Noise Cancellation with Transparency Mode, 13mm deep bass titanium drivers, Quad-mic ENC for crystal-clear calls and up to 36 hours total battery backup.',
        price: 1599,
        original_price: 3499,
        badge: 'BESTSELLER',
        in_stock: true,
        image_url: '/images/tws-earbuds.png',
        specs: { Battery: '36 Hours Total (Case + Buds)', Bluetooth: 'v5.3 Low Latency 45ms', NoiseCancellation: '35dB Hybrid ANC', WaterResistance: 'IPX5 Sweatproof' },
        is_featured: true
      },
      {
        name: 'Extra Bass Bluetooth Sports Neckband',
        slug: 'extra-bass-bluetooth-sports-neckband',
        category_slug: 'audio-tws',
        description: 'Ergonomic magnetic neckband with 50-hour non-stop battery, vibration call alert, fast charge (10 mins = 10 hours playback) and punchy bass.',
        price: 699,
        original_price: 1499,
        badge: null,
        in_stock: true,
        image_url: '/images/tws-earbuds.png',
        specs: { Playback: '50 Hours Battery', Drivers: '11.2mm Dynamic Bass Boost', Charging: 'Type-C ASAP Charge' },
        is_featured: false
      },
      {
        name: 'Hi-Res Type-C Wired Earphones with DAC',
        slug: 'hi-res-type-c-wired-earphones-with-dac',
        category_slug: 'audio-tws',
        description: 'Built-in 24-bit 96kHz Digital-to-Analog converter (DAC) provides lossless audio for phones without 3.5mm jack. Tangle-resistant braided cable and inline HD mic.',
        price: 399,
        original_price: 799,
        badge: 'SALE',
        in_stock: true,
        image_url: '/images/tws-earbuds.png',
        specs: { Connector: 'Type-C Digital (Built-in DAC)', AudioQuality: 'Hi-Res Lossless 24-bit/96kHz', Controls: '3-Button Inline Remote' },
        is_featured: false
      },
      {
        name: '20,000mAh 22.5W Fast Charging Power Bank',
        slug: '20000mah-22-5w-fast-charging-power-bank',
        category_slug: 'power-banks',
        description: 'Heavy duty high-density lithium polymer power bank with triple output (2x USB-A + 1x Type-C Bi-directional PD), LED digital battery percentage display, flight-safe approved.',
        price: 1499,
        original_price: 2999,
        badge: 'HOT',
        in_stock: true,
        image_url: '/images/power-bank.png',
        specs: { Capacity: '20000mAh / 74Wh', MaxOutput: '22.5W Fast Charge (PD + VOOC + QC)', Display: 'Smart Digital LED Percentage', Ports: '3 Outputs + 2 Inputs' },
        is_featured: true
      },
      {
        name: '10,000mAh Magnetic MagSafe Slim Power Bank',
        slug: '10000mah-magsafe-slim-power-bank',
        category_slug: 'power-banks',
        description: 'Snaps firmly to the back of MagSafe compatible iPhones and phones with magnetic rings. Features 15W wireless charging + 20W PD wired Type-C port in an ultra-slim aluminum body.',
        price: 1299,
        original_price: 2499,
        badge: 'NEW',
        in_stock: true,
        image_url: '/images/power-bank.png',
        specs: { Capacity: '10000mAh', WirelessOutput: '15W Fast Wireless', WiredOutput: '20W PD Type-C', Thickness: '14mm Pocket Slim' },
        is_featured: false
      },
      {
        name: '100W 6ft Nylon Braided Type-C to Type-C Cable',
        slug: '100w-6ft-nylon-braided-type-c-cable',
        category_slug: 'cables-adapters',
        description: 'Tangle-free military-grade ballistic nylon braided wire with E-marker smart chip for up to 100W 5A fast charging and 480Mbps high-speed data transfer.',
        price: 299,
        original_price: 699,
        badge: 'SALE',
        in_stock: true,
        image_url: '/images/braided-cable.png',
        specs: { Length: '2 Meters / 6.6 Feet', Rating: '100W / 5A Power Delivery', BendTest: '25,000+ Bends Durability Rating' },
        is_featured: true
      },
      {
        name: '4-in-1 Universal Fast Charging Multi Cable',
        slug: '4-in-1-universal-fast-charging-multi-cable',
        category_slug: 'cables-adapters',
        description: 'One cable for all devices: Type-C, Lightning, Micro USB and USB-A connectors in a heavy duty braided jacket with reinforced strain relief collars.',
        price: 349,
        original_price: 699,
        badge: null,
        in_stock: true,
        image_url: '/images/braided-cable.png',
        specs: { Connectors: 'USB-C, Lightning, Micro-USB, USB-A', MaxCurrent: '3.5A Fast Charging', Length: '1.2 Meters' },
        is_featured: false
      },
      {
        name: '360 Magnetic Car Dashboard Mobile Mount',
        slug: '360-magnetic-car-dashboard-mobile-mount',
        category_slug: 'car-accessories',
        description: 'Equipped with 6 ultra-strong N52 neodymium magnets and high-grade 3M adhesive pad. 360-degree rotation ball head allows smooth portrait or landscape navigation viewing.',
        price: 399,
        original_price: 899,
        badge: null,
        in_stock: true,
        image_url: '/images/car-mount.png',
        specs: { Mounting: '3M Heavy Duty Dashboard Adhesive', Magnets: '6x Strong N52 Neodymium', Rotation: '360 Full Swivel Ball Joint' },
        is_featured: false
      },
      {
        name: '15W Smart Auto-Clamping Wireless Car Charger',
        slug: '15w-smart-auto-clamping-car-charger',
        category_slug: 'car-accessories',
        description: 'Infrared auto-sensor opens motorized clamp arms automatically when phone approaches, clamping securely and charging up to 15W wirelessly.',
        price: 1199,
        original_price: 2299,
        badge: 'HOT',
        in_stock: true,
        image_url: '/images/car-mount.png',
        specs: { Sensor: 'Infrared Smart Motorized Sensor', WirelessPower: '15W Qi Fast Charge', MountType: 'Air Vent Clip + Dashboard Suction Arm' },
        is_featured: true
      },
      {
        name: 'Titanium Camera Lens Protector Ring Set',
        slug: 'titanium-camera-lens-protector-ring-set',
        category_slug: 'smart-accessories',
        description: 'Individual aero-metal aluminum alloy rings with 9H sapphire tempered glass to safeguard your phone camera lenses without distorting flash or night photo clarity.',
        price: 249,
        original_price: 499,
        badge: 'NEW',
        in_stock: true,
        image_url: '/images/smart-strap.png',
        specs: { Material: 'Aviation Aluminum + 9H Sapphire', Clarity: '99.9% HD Clear Optical', Thickness: 'Zero Flash Glare and No Distortion' },
        is_featured: false
      },
      {
        name: 'Ocean Band Silicone Smartwatch Strap',
        slug: 'ocean-band-silicone-smartwatch-strap',
        category_slug: 'smart-accessories',
        description: 'High-performance fluoroelastomer with tubular geometry that stretches for a secure fit, even over wetsuits. Corrosion-resistant titanium buckle for 20mm/22mm/Apple Watch.',
        price: 349,
        original_price: 799,
        badge: 'HOT',
        in_stock: true,
        image_url: '/images/smart-strap.png',
        specs: { Material: 'High-Grade Silicone Fluoroelastomer', Buckle: 'Titanium Adjustable Loop', Sizes: '20mm, 22mm, Apple Watch 38-49mm' },
        is_featured: true
      }
    ];

    for (const prod of products) {
      const catId = categoryMap[prod.category_slug];
      await client.query(
        `INSERT INTO products (category_id, name, slug, description, price, original_price, badge, in_stock, image_url, specs, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [catId, prod.name, prod.slug, prod.description, prod.price, prod.original_price, prod.badge, prod.in_stock, prod.image_url, JSON.stringify(prod.specs), prod.is_featured]
      );
    }

    // 3. Seed Google Reviews (Clean text, zero emojis)
    const reviews = [
      {
        author_name: 'Vikram Joshi (AECS Layout)',
        rating: 5,
        comment: 'Best mobile accessories store in AECS Layout. Got edge-to-edge tempered glass fitted on my iPhone 15 Pro with zero bubbles in just two minutes. Extremely polite staff and genuine pricing.',
        source: 'Google Review',
        review_date: '2 weeks ago',
        is_verified: true
      },
      {
        author_name: 'Ananya Sharma (Brookefield)',
        rating: 5,
        comment: 'Great collection of premium MagSafe covers and fast chargers. Located right opposite Kanti Sweets so very easy to find. Highly recommended for all phone accessories in the area.',
        source: 'Google Review',
        review_date: '1 month ago',
        is_verified: true
      },
      {
        author_name: 'Rahul R. Menon (Kundalahalli)',
        rating: 5,
        comment: 'Bought a 65W GaN adapter and braided Type-C cable. Works flawlessly with both my MacBook and OnePlus. Authentic products at honest market rates.',
        source: 'Google Review',
        review_date: '3 weeks ago',
        is_verified: true
      },
      {
        author_name: 'Pooja Hegde (ITPB Road)',
        rating: 5,
        comment: 'Super fast WhatsApp response when I enquired about screen guard availability for my Samsung S24 Ultra. Visited store and received complimentary fitting.',
        source: 'Google Review',
        review_date: '2 months ago',
        is_verified: true
      },
      {
        author_name: 'Karthik Balakrishnan (B Block, AECS)',
        rating: 5,
        comment: 'My regular neighborhood store for any gadget accessories. They stock good quality TWS earbuds and power banks. Very helpful store owner.',
        source: 'Google Review',
        review_date: '1 month ago',
        is_verified: true
      }
    ];

    for (const rev of reviews) {
      await client.query(
        `INSERT INTO reviews (author_name, rating, comment, source, review_date, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rev.author_name, rev.rating, rev.comment, rev.source, rev.review_date, rev.is_verified]
      );
    }

    // 4. Seed Store Settings
    const settings = [
      ['store_name', config.store.name],
      ['store_phone', config.store.phone],
      ['store_whatsapp', config.store.whatsapp],
      ['store_address', config.store.address],
      ['store_hours', config.store.hours],
      ['google_maps_url', config.store.mapsUrl]
    ];

    for (const [key, val] of settings) {
      await client.query(
        `INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, val]
      );
    }

    await client.query('COMMIT');
    console.log('Database seeded with 20 items, local generated PNG images, zero emojis, and complete accessories inventory.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { seed };
