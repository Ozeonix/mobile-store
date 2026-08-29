# Tech Talk Mobile — Production-Ready Full-Stack Web Application

A high-performance, mobile-first full-stack web application for **Tech Talk Mobile**, a mobile accessories retail store located in AECS Layout, Brookefield, Bengaluru (Opposite Kanti Sweets). Built with **Node.js (Express)**, **PostgreSQL**, **EJS**, and containerized using **Docker** and **Docker Compose**.

---

## Key Features

1. **Fluid Responsive UI/UX Design System**:
   - Dynamic `clamp()` tokens for typography, card paddings, margins, and grid gaps across mobile (320px–480px), tablet (768px), and desktop (1024px–1440px+).
   - **Native Mobile App Experience**: Fixed bottom tab bar (Home, Store, WhatsApp, Reviews, Visit Showroom), 2-column mobile shopping cards, horizontal touch-swipeable category chips, and sticky bottom WhatsApp action bar on product detail pages.
   - **Zero Emojis**: 100% crisp inline embedded SVG icon engine (`<%- icon('name', size) %>`).

2. **Custom Generated PNG Image Assets**:
   - 9 high-resolution PNG product & showcase assets in `public/images/`:
     - `hero-banner.png` (Hero showroom showcase)
     - `tempered-glass.png` (11D edge-to-edge screen protector)
     - `magsafe-case.png` (MagSafe frosted armor case)
     - `gan-charger.png` (65W GaN dual-port fast adapter)
     - `tws-earbuds.png` (Pro ANC wireless earbuds)
     - `power-bank.png` (20,000mAh fast charging battery pack)
     - `car-mount.png` (360 magnetic dashboard mount)
     - `braided-cable.png` (100W braided Type-C cable)
     - `smart-strap.png` (Smartwatch strap & camera lens rings)

3. **PostgreSQL Database & Resilient Architecture**:
   - Dynamic schema for `categories`, `products`, `reviews`, `inquiries`, and `store_settings`.
   - Automatic migrations (`src/db/migrate.js`) and database seeding (`src/db/seed.js`).
   - Supports both `DATABASE_URL` (cloud-managed PostgreSQL with SSL) and individual `DB_HOST`/`DB_USER` parameters.
   - In-memory fallback mode for local testing without PostgreSQL.

4. **Real-Time Admin Inventory & Management Portal (`/admin`)**:
   - Real-time product creation and edit form with dynamic key-value specification builder.
   - 1-click In-Stock / Out-of-Stock toggle.
   - Categories CRUD with SVG icon selection.
   - Customer leads tracker with 1-click WhatsApp customer reply.
   - Live Store Settings editor (update WhatsApp, telephone, address, and hours in real time).

---

## Deployment Options

### Option 1: Docker & Docker Compose (Recommended for VPS / Cloud VMs)

Works on any Linux VM (Ubuntu, Debian, AWS EC2, DigitalOcean Droplet, Linode, GCP Compute Engine).

#### 1. Clone & Build
```bash
git clone <repo-url>
cd "mobile store"
docker compose up -d --build
```

#### 2. Verify Deployment
```bash
curl http://localhost:3000/api/health
```

#### 3. View Logs
```bash
docker compose logs -f app
```

---

### Option 2: Cloud PaaS (Render / Railway / Fly.io / Cloud Run)

1. **Create a Managed PostgreSQL Database** on your platform (e.g. Render PostgreSQL, Railway Postgres, Neon, or Supabase).
2. **Set Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (or platform default)
   - `DATABASE_URL`: `postgresql://user:password@host:5432/dbname?sslmode=require`
   - `STORE_NAME`: `Tech Talk Mobile`
   - `STORE_PHONE`: `+919876543210`
   - `STORE_WHATSAPP`: `919876543210`
   - `STORE_ADDRESS`: `Opposite Kanti Sweets, B Block, AECS Layout, Brookefield, Bengaluru – 560037`
   - `STORE_HOURS`: `Mon – Sat · 9:00 AM – 8:00 PM`
   - `GOOGLE_MAPS_URL`: `https://maps.google.com/?q=AECS+Layout+Brookefield+Bengaluru+opposite+Kanti+Sweets`
   - `ADMIN_SECRET`: `your_secure_admin_password`
3. **Build & Start Command**:
   - Build Command: `npm install --omit=dev`
   - Start Command: `npm start`

---

### Option 3: Bare Metal / Linux Server with PM2 & NGINX

#### 1. Install Node.js & PM2
```bash
sudo apt update && sudo apt install -y nodejs npm postgresql postgresql-contrib nginx
sudo npm install -g pm2
```

#### 2. Install Project Dependencies & Configure
```bash
npm install --omit=dev
cp .env.example .env
# Edit .env with your production credentials
nano .env
```

#### 3. Run Database Migrations & Seeds
```bash
npm run migrate
npm run seed
```

#### 4. Launch with PM2
```bash
pm2 start src/app.js --name "tech-talk-mobile" -i max
pm2 save
pm2 startup
```

#### 5. Sample NGINX Reverse Proxy Configuration (`/etc/nginx/sites-available/techtalk`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Health Check & Verification Endpoints

- **Storefront**: `GET /`
- **Catalog**: `GET /products`
- **Product Detail**: `GET /products/11d-curved-edge-tempered-glass`
- **Customer Reviews**: `GET /reviews`
- **Showroom Location**: `GET /contact`
- **Admin Dashboard**: `GET /admin`
- **Health Check API**: `GET /api/health` -> `{"status":"healthy","database":"postgresql-connected"}`

---

## License

ISC © Tech Talk Mobile · AECS Layout, Brookefield, Bengaluru
