const { Pool } = require('pg');
const config = require('../config');

// PostgreSQL Pool Connection supporting both connectionString and host/port parameters
const poolConfig = config.db.connectionString
  ? {
      connectionString: config.db.connectionString,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 20
    }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
      max: 20
    };

const pool = new Pool(poolConfig);

// In-Memory fallback store for standalone development without running PostgreSQL
let isUsingFallback = false;

const memoryStore = {
  categories: [
    { id: 1, name: 'Screen Protectors', slug: 'screen-protectors', icon: 'shield', description: 'Edge-to-edge 11D tempered glass, matte privacy and UV curved protectors.', display_order: 1, image_url: '/images/tempered-glass.png' },
    { id: 2, name: 'Cases and Covers', slug: 'cases-covers', icon: 'smartphone', description: 'MagSafe, rugged armor, liquid silicone and luxury leather cases.', display_order: 2, image_url: '/images/magsafe-case.png' },
    { id: 3, name: 'Fast Chargers', slug: 'fast-chargers', icon: 'zap', description: 'GaN 65W/100W PD adapters, wireless charging stations and car plugs.', display_order: 3, image_url: '/images/gan-charger.png' },
    { id: 4, name: 'Audio and TWS', slug: 'audio-tws', icon: 'headphones', description: 'Active Noise Cancelling earbuds, Bluetooth neckbands and studio audio.', display_order: 4, image_url: '/images/tws-earbuds.png' },
    { id: 5, name: 'Power Banks', slug: 'power-banks', icon: 'battery', description: '10,000mAh to 30,000mAh fast-charging portable power banks.', display_order: 5, image_url: '/images/power-bank.png' },
    { id: 6, name: 'Car Accessories', slug: 'car-accessories', icon: 'car', description: 'Magnetic dashboard mounts, wireless charging car clamps and audio adapters.', display_order: 6, image_url: '/images/car-mount.png' },
    { id: 7, name: 'Cables and Adapters', slug: 'cables-adapters', icon: 'cable', description: 'Braided Type-C to Type-C, Lightning, OTG and durable fast charging cables.', display_order: 7, image_url: '/images/braided-cable.png' },
    { id: 8, name: 'Smart Accessories', slug: 'smart-accessories', icon: 'watch', description: 'Smartwatch straps, camera lens protectors, ring holders and desktop stands.', display_order: 8, image_url: '/images/smart-strap.png' }
  ],
  products: [
    {
      id: 1, category_id: 1, category_name: 'Screen Protectors', category_slug: 'screen-protectors',
      name: '11D Curved Edge Tempered Glass', slug: '11d-curved-edge-tempered-glass',
      description: 'Ultra-tough 9H hardness tempered glass with 11D curved edge finish. Oleophobic nano-coating repels fingerprints, oils, and scratches. Free professional installation at our AECS Layout store.',
      price: 299, original_price: 599, badge: 'BESTSELLER', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
      specs: { Hardness: '9H Sapphire Glass', Thickness: '0.33mm Ultra Thin', Compatibility: 'iPhone 13-16, Samsung S21-S24, OnePlus, Pixel', InBox: 'Glass, Wet Wipes, Microfiber Cloth, Dust Sticker' },
      is_featured: true
    },
    {
      id: 2, category_id: 1, category_name: 'Screen Protectors', category_slug: 'screen-protectors',
      name: 'Privacy Anti-Spy Matte Glass', slug: 'privacy-anti-spy-matte-glass',
      description: '28-degree micro-louver privacy filter prevents shoulder surfers from viewing your screen. Matte anti-glare finish blocks reflections in bright daylight.',
      price: 399, original_price: 799, badge: 'HOT', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      specs: { PrivacyAngle: '28 Degrees Viewing Angle', Coating: 'Anti-Glare Matte Oleophobic', TouchSensitivity: 'High Precision Gaming Ready' },
      is_featured: true
    },
    {
      id: 3, category_id: 1, category_name: 'Screen Protectors', category_slug: 'screen-protectors',
      name: 'UV Curved Liquid Glue Tempered Glass', slug: 'uv-curved-liquid-glue-glass',
      description: 'Specially engineered for curved display flagships. Optical clear liquid adhesive cured with UV light ensures zero edge bubbles and full in-display ultrasonic fingerprint unlock compatibility.',
      price: 599, original_price: 1199, badge: 'NEW', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      specs: { Technology: 'Liquid Optical UV Adhesive', FingerprintSupport: 'Ultrasonic In-Display Fast Unlock', Compatibility: 'Samsung S23/S24 Ultra, Vivo X100, OnePlus 12' },
      is_featured: false
    },
    {
      id: 4, category_id: 2, category_name: 'Cases and Covers', category_slug: 'cases-covers',
      name: 'MagSafe Armor Translucent Case', slug: 'magsafe-armor-translucent-case',
      description: 'Military-grade drop protection with integrated N52 strong neodymium magnets for super-fast MagSafe wireless charging. Frosted matte scratch-resistant backplate.',
      price: 499, original_price: 999, badge: 'BESTSELLER', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      specs: { DropTested: '10ft Military Standard', Magnets: '36x N52 Strong Array', Material: 'TPU Shock Bumper + Polycarbonate Back' },
      is_featured: true
    },
    {
      id: 5, category_id: 2, category_name: 'Cases and Covers', category_slug: 'cases-covers',
      name: 'Liquid Silicone Soft Touch Cover', slug: 'liquid-silicone-soft-touch-cover',
      description: 'Silky smooth premium liquid silicone with microfiber inner lining that prevents back glass micro-scratches. Raised camera bezel lip for lens protection.',
      price: 349, original_price: 699, badge: 'NEW', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=600&auto=format&fit=crop&q=80',
      specs: { Material: 'Medical Grade Liquid Silicone', Lining: 'Microfiber Suede', Washable: 'Yes, Clean With Damp Cloth' },
      is_featured: false
    },
    {
      id: 6, category_id: 2, category_name: 'Cases and Covers', category_slug: 'cases-covers',
      name: 'Heavy Duty 360 Kickstand Armor Case', slug: 'heavy-duty-360-kickstand-armor-case',
      description: 'Dual layer rugged protective shell with zinc alloy 360-degree rotating ring kickstand and built-in sliding camera lens privacy cover.',
      price: 449, original_price: 899, badge: null, in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
      specs: { Kickstand: '360 Swivel Metal Ring', CameraProtection: 'Slide Shutter Guard', Compatibility: 'Redmi, Realme, Poco, Moto, Samsung A Series' },
      is_featured: false
    },
    {
      id: 7, category_id: 3, category_name: 'Fast Chargers', category_slug: 'fast-chargers',
      name: '65W GaN Dual Port Fast Adapter (Type-C + USB)', slug: '65w-gan-dual-port-fast-adapter',
      description: 'Gallium Nitride (GaN) III technology delivers full 65W Power Delivery in a pocket-sized form factor. Safely charge laptops, tablets, iPhone, Samsung Super Fast 2.0 and OnePlus devices.',
      price: 1299, original_price: 2499, badge: 'HOT', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      specs: { Output: '65W Max (PD 3.0 + QC 4.0)', Ports: '1x Type-C + 1x USB-A', Protection: 'Overcurrent, Overheat, Short Circuit' },
      is_featured: true
    },
    {
      id: 8, category_id: 3, category_name: 'Fast Chargers', category_slug: 'fast-chargers',
      name: '20W PD Type-C Super Fast Adapter', slug: '20w-pd-type-c-super-fast-adapter',
      description: 'Charges your iPhone 0 to 50% in just 25 minutes. Compact, travel-friendly, BIS certified for Indian electrical standards with zero thermal throttling.',
      price: 499, original_price: 999, badge: 'SALE', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80',
      specs: { Power: '20W Power Delivery', Port: 'USB Type-C', Certification: 'BIS Certified Safety' },
      is_featured: false
    },
    {
      id: 9, category_id: 3, category_name: 'Fast Chargers', category_slug: 'fast-chargers',
      name: '3-in-1 Foldable Magnetic Wireless Charging Station', slug: '3-in-1-magnetic-wireless-charging-station',
      description: 'Simultaneously charges your smartphone (15W), smartwatch (2.5W), and wireless earbuds (5W) with intelligent device detection and fold-flat travel portability.',
      price: 1899, original_price: 3799, badge: 'NEW', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop&q=80',
      specs: { TotalOutput: '22.5W Max', WirelessStandards: 'Qi Certified + MagSafe Compatible', Folding: '180 Flat Compact Fold' },
      is_featured: true
    },
    {
      id: 10, category_id: 4, category_name: 'Audio and TWS', category_slug: 'audio-tws',
      name: 'Pro ANC Wireless Earbuds (TWS)', slug: 'pro-anc-wireless-earbuds-tws',
      description: '35dB Active Noise Cancellation with Transparency Mode, 13mm deep bass titanium drivers, Quad-mic ENC for crystal-clear calls and up to 36 hours total battery backup.',
      price: 1599, original_price: 3499, badge: 'BESTSELLER', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      specs: { Battery: '36 Hours Total (Case + Buds)', Bluetooth: 'v5.3 Low Latency 45ms', NoiseCancellation: '35dB Hybrid ANC', WaterResistance: 'IPX5 Sweatproof' },
      is_featured: true
    },
    {
      id: 11, category_id: 4, category_name: 'Audio and TWS', category_slug: 'audio-tws',
      name: 'Extra Bass Bluetooth Sports Neckband', slug: 'extra-bass-bluetooth-sports-neckband',
      description: 'Ergonomic magnetic neckband with 50-hour non-stop battery, vibration call alert, fast charge (10 mins = 10 hours playback) and punchy bass.',
      price: 699, original_price: 1499, badge: null, in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=600&auto=format&fit=crop&q=80',
      specs: { Playback: '50 Hours Battery', Drivers: '11.2mm Dynamic Bass Boost', Charging: 'Type-C ASAP Charge' },
      is_featured: false
    },
    {
      id: 12, category_id: 4, category_name: 'Audio and TWS', category_slug: 'audio-tws',
      name: 'Hi-Res Type-C Wired Earphones with DAC', slug: 'hi-res-type-c-wired-earphones-with-dac',
      description: 'Built-in 24-bit 96kHz Digital-to-Analog converter (DAC) provides lossless audio for phones without 3.5mm jack. Tangle-resistant braided cable and inline HD mic.',
      price: 399, original_price: 799, badge: 'SALE', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      specs: { Connector: 'Type-C Digital (Built-in DAC)', AudioQuality: 'Hi-Res Lossless 24-bit/96kHz', Controls: '3-Button Inline Remote' },
      is_featured: false
    },
    {
      id: 13, category_id: 5, category_name: 'Power Banks', category_slug: 'power-banks',
      name: '20,000mAh 22.5W Fast Charging Power Bank', slug: '20000mah-22-5w-fast-charging-power-bank',
      description: 'Heavy duty high-density lithium polymer power bank with triple output (2x USB-A + 1x Type-C Bi-directional PD), LED digital battery percentage display, flight-safe approved.',
      price: 1499, original_price: 2999, badge: 'HOT', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80',
      specs: { Capacity: '20000mAh / 74Wh', MaxOutput: '22.5W Fast Charge (PD + VOOC + QC)', Display: 'Smart Digital LED Percentage', Ports: '3 Outputs + 2 Inputs' },
      is_featured: true
    },
    {
      id: 14, category_id: 5, category_name: 'Power Banks', category_slug: 'power-banks',
      name: '10,000mAh Magnetic MagSafe Slim Power Bank', slug: '10000mah-magsafe-slim-power-bank',
      description: 'Snaps firmly to the back of MagSafe compatible iPhones and phones with magnetic rings. Features 15W wireless charging + 20W PD wired Type-C port in an ultra-slim aluminum body.',
      price: 1299, original_price: 2499, badge: 'NEW', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
      specs: { Capacity: '10000mAh', WirelessOutput: '15W Fast Wireless', WiredOutput: '20W PD Type-C', Thickness: '14mm Pocket Slim' },
      is_featured: false
    },
    {
      id: 15, category_id: 7, category_name: 'Cables and Adapters', category_slug: 'cables-adapters',
      name: '100W 6ft Nylon Braided Type-C to Type-C Cable', slug: '100w-6ft-nylon-braided-type-c-cable',
      description: 'Tangle-free military-grade ballistic nylon braided wire with E-marker smart chip for up to 100W 5A fast charging and 480Mbps high-speed data transfer.',
      price: 299, original_price: 699, badge: 'SALE', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      specs: { Length: '2 Meters / 6.6 Feet', Rating: '100W / 5A Power Delivery', BendTest: '25,000+ Bends Durability Rating' },
      is_featured: true
    },
    {
      id: 16, category_id: 7, category_name: 'Cables and Adapters', category_slug: 'cables-adapters',
      name: '4-in-1 Universal Fast Charging Multi Cable', slug: '4-in-1-universal-fast-charging-multi-cable',
      description: 'One cable for all devices: Type-C, Lightning, Micro USB and USB-A connectors in a heavy duty braided jacket with reinforced strain relief collars.',
      price: 349, original_price: 699, badge: null, in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80',
      specs: { Connectors: 'USB-C, Lightning, Micro-USB, USB-A', MaxCurrent: '3.5A Fast Charging', Length: '1.2 Meters' },
      is_featured: false
    },
    {
      id: 17, category_id: 6, category_name: 'Car Accessories', category_slug: 'car-accessories',
      name: '360 Magnetic Car Dashboard Mobile Mount', slug: '360-magnetic-car-dashboard-mobile-mount',
      description: 'Equipped with 6 ultra-strong N52 neodymium magnets and high-grade 3M adhesive pad. 360-degree rotation ball head allows smooth portrait or landscape navigation viewing.',
      price: 399, original_price: 899, badge: null, in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      specs: { Mounting: '3M Heavy Duty Dashboard Adhesive', Magnets: '6x Strong N52 Neodymium', Rotation: '360 Full Swivel Ball Joint' },
      is_featured: false
    },
    {
      id: 18, category_id: 6, category_name: 'Car Accessories', category_slug: 'car-accessories',
      name: '15W Smart Auto-Clamping Wireless Car Charger', slug: '15w-smart-auto-clamping-car-charger',
      description: 'Infrared auto-sensor opens motorized clamp arms automatically when phone approaches, clamping securely and charging up to 15W wirelessly.',
      price: 1199, original_price: 2299, badge: 'HOT', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      specs: { Sensor: 'Infrared Smart Motorized Sensor', WirelessPower: '15W Qi Fast Charge', MountType: 'Air Vent Clip + Dashboard Suction Arm' },
      is_featured: true
    },
    {
      id: 19, category_id: 8, category_name: 'Smart Accessories', category_slug: 'smart-accessories',
      name: 'Titanium Camera Lens Protector Ring Set', slug: 'titanium-camera-lens-protector-ring-set',
      description: 'Individual aero-metal aluminum alloy rings with 9H sapphire tempered glass to safeguard your phone camera lenses without distorting flash or night photo clarity.',
      price: 249, original_price: 499, badge: 'NEW', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      specs: { Material: 'Aviation Aluminum + 9H Sapphire', Clarity: '99.9% HD Clear Optical', Thickness: 'Zero Flash Glare and No Distortion' },
      is_featured: false
    },
    {
      id: 20, category_id: 8, category_name: 'Smart Accessories', category_slug: 'smart-accessories',
      name: 'Ocean Band Silicone Smartwatch Strap', slug: 'ocean-band-silicone-smartwatch-strap',
      description: 'High-performance fluoroelastomer with tubular geometry that stretches for a secure fit, even over wetsuits. Corrosion-resistant titanium buckle for 20mm/22mm/Apple Watch.',
      price: 349, original_price: 799, badge: 'HOT', in_stock: true,
      image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      specs: { Material: 'High-Grade Silicone Fluoroelastomer', Buckle: 'Titanium Adjustable Loop', Sizes: '20mm, 22mm, Apple Watch 38-49mm' },
      is_featured: true
    }
  ],
  reviews: [
    {
      id: 1, author_name: 'Vikram Joshi (AECS Layout)', rating: 5,
      comment: 'Best mobile accessories store in AECS Layout. Got edge-to-edge tempered glass fitted on my iPhone 15 Pro with zero bubbles in just two minutes. Extremely polite staff and genuine pricing.',
      source: 'Google Review', review_date: '2 weeks ago', is_verified: true
    },
    {
      id: 2, author_name: 'Ananya Sharma (Brookefield)', rating: 5,
      comment: 'Great collection of premium MagSafe covers and fast chargers. Located right opposite Kanti Sweets so very easy to find. Highly recommended for all phone accessories in the area.',
      source: 'Google Review', review_date: '1 month ago', is_verified: true
    },
    {
      id: 3, author_name: 'Rahul R. Menon (Kundalahalli)', rating: 5,
      comment: 'Bought a 65W GaN adapter and braided Type-C cable. Works flawlessly with both my MacBook and OnePlus. Authentic products at honest market rates.',
      source: 'Google Review', review_date: '3 weeks ago', is_verified: true
    },
    {
      id: 4, author_name: 'Pooja Hegde (ITPB Road)', rating: 5,
      comment: 'Super fast WhatsApp response when I enquired about screen guard availability for my Samsung S24 Ultra. Visited store and received complimentary fitting.',
      source: 'Google Review', review_date: '2 months ago', is_verified: true
    },
    {
      id: 5, author_name: 'Karthik Balakrishnan (B Block, AECS)', rating: 5,
      comment: 'My regular neighborhood store for any gadget accessories. They stock good quality TWS earbuds and power banks. Very helpful store owner.',
      source: 'Google Review', review_date: '1 month ago', is_verified: true
    }
  ],
  inquiries: [],
  settings: {
    store_name: config.store.name,
    store_phone: config.store.phone,
    store_whatsapp: config.store.whatsapp,
    store_address: config.store.address,
    store_hours: config.store.hours,
    google_maps_url: config.store.mapsUrl
  }
};

const query = async (text, params = []) => {
  if (isUsingFallback) {
    return handleFallbackQuery(text, params);
  }

  try {
    return await pool.query(text, params);
  } catch (error) {
    if (!isUsingFallback && (error.code === 'ECONNREFUSED' || error.message.includes('connect'))) {
      console.warn('PostgreSQL unavailable. Switching seamlessly to in-memory store for local preview.');
      isUsingFallback = true;
      return handleFallbackQuery(text, params);
    }
    throw error;
  }
};

function handleFallbackQuery(text, params) {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Categories list
  if (lower.startsWith('select * from categories') || lower.includes('from categories')) {
    if (lower.includes('where slug =')) {
      const slug = params[0];
      const cat = memoryStore.categories.find(c => c.slug === slug);
      return { rows: cat ? [cat] : [] };
    }
    if (lower.includes('where id =')) {
      const id = parseInt(params[0], 10);
      const cat = memoryStore.categories.find(c => c.id === id);
      return { rows: cat ? [cat] : [] };
    }
    return { rows: [...memoryStore.categories].sort((a, b) => a.display_order - b.display_order) };
  }

  // Single Product by ID or Slug
  if (lower.includes('from products') && (lower.includes('where p.id =') || lower.includes('where products.id =') || lower.includes('where id ='))) {
    const id = parseInt(params[0], 10);
    const prod = memoryStore.products.find(p => p.id === id);
    return { rows: prod ? [prod] : [] };
  }
  if (lower.includes('from products') && (lower.includes('where p.slug =') || lower.includes('where products.slug =') || lower.includes('where slug ='))) {
    const slug = params[0];
    const prod = memoryStore.products.find(p => p.slug === slug);
    return { rows: prod ? [prod] : [] };
  }

  // Products with category filter, search, sorting
  if (lower.includes('from products')) {
    let list = [...memoryStore.products];
    if (lower.includes('is_featured = true')) {
      list = list.filter(p => p.is_featured);
    }
    if (lower.includes('category_id =')) {
      const catId = parseInt(params[0], 10);
      if (catId) list = list.filter(p => p.category_id === catId);
    }
    if (lower.includes('count(*)')) {
      return { rows: [{ count: list.length }] };
    }
    return { rows: list };
  }

  // Reviews
  if (lower.includes('from reviews')) {
    if (lower.includes('count(*)')) {
      return { rows: [{ count: memoryStore.reviews.length, avg_rating: '5.0' }] };
    }
    return { rows: [...memoryStore.reviews].reverse() };
  }

  // Insert review
  if (lower.startsWith('insert into reviews')) {
    const newRev = {
      id: memoryStore.reviews.length + 1,
      author_name: params[0],
      rating: params[1],
      comment: params[2],
      source: params[3] || 'Customer Feedback',
      review_date: 'Just now',
      is_verified: true,
      created_at: new Date()
    };
    memoryStore.reviews.push(newRev);
    return { rows: [newRev] };
  }

  // Inquiries
  if (lower.includes('from inquiries')) {
    if (lower.includes('count(*)')) {
      return { rows: [{ count: memoryStore.inquiries.length }] };
    }
    return { rows: [...memoryStore.inquiries].reverse() };
  }

  // Insert Inquiry
  if (lower.startsWith('insert into inquiries')) {
    const newInq = {
      id: memoryStore.inquiries.length + 1,
      customer_name: params[0],
      phone: params[1],
      product_name: params[2],
      message: params[3],
      status: 'pending',
      created_at: new Date()
    };
    memoryStore.inquiries.push(newInq);
    return { rows: [newInq] };
  }

  // Settings
  if (lower.includes('from store_settings')) {
    const rows = Object.entries(memoryStore.settings).map(([key, value], idx) => ({ id: idx + 1, key, value }));
    return { rows };
  }

  // Insert / Update Settings
  if (lower.includes('store_settings')) {
    if (params.length >= 2) {
      memoryStore.settings[params[0]] = params[1];
    }
    return { rows: [] };
  }

  return { rows: [] };
}

const checkConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Connected to PostgreSQL database.');
    return true;
  } catch (err) {
    console.warn(`PostgreSQL not reachable on ${config.db.host}:${config.db.port}. Using dynamic fallback in-memory mode.`);
    isUsingFallback = true;
    return false;
  }
};

module.exports = {
  pool,
  query,
  checkConnection,
  isUsingFallback: () => isUsingFallback,
  memoryStore
};
