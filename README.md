# Hi Suvai — Pure Taste, Ancient Roots (Full-Stack eCommerce)

A production-hardened full-stack eCommerce web application celebrating traditional South Indian foods, heritage grains, handcrafted health mixes, and pure taste from Tamil Nadu.

---

## 🌟 Architecture & Directory Structure

```text
hisuvai/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Admin JWT authentication
│   │   ├── customerController.js # Customer auth (claim account, login), profile & addresses
│   │   ├── orderController.js    # Order placement, price verification, stock deduction, tracking
│   │   ├── productController.js  # CRUD, ReDoS-safe search, filters, multi-image upload
│   │   └── settingController.js  # Store settings & customization
│   ├── middleware/
│   │   ├── authMiddleware.js     # protectAdmin & protectCustomer JWT verification
│   │   ├── uploadMiddleware.js   # Multer storage with strict MIME/extension filter (.jpg, .png, .webp)
│   │   └── rateLimiters.js       # Express rate limiters for auth, orders, and APIs
│   ├── models/
│   │   ├── Admin.js              # Admin schema with bcrypt password hashing
│   │   ├── Customer.js           # Customer schema with unique email index & addresses
│   │   ├── Order.js              # Order schema with items, pricing, payment, and status history
│   │   ├── Product.js            # Product catalog schema with stock inventory
│   │   ├── Banner.js             # Hero & promotion banners
│   │   └── Setting.js            # Global store settings
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── customerRoutes.js     # /api/customers endpoints
│   │   ├── orderRoutes.js        # /api/orders endpoints (with protectAdmin & protectCustomer)
│   │   ├── productRoutes.js      # /api/products endpoints
│   │   ├── bannerRoutes.js       # /api/banners endpoints
│   │   ├── settingRoutes.js      # /api/settings endpoints
│   │   └── paymentRoutes.js      # Razorpay payment routes & stats
│   ├── scripts/
│   │   ├── dedupe-customers.js   # Read-only audit script for duplicate customer emails
│   │   └── optimize_assets.py    # Automated image conversion to WebP & favicon generation
│   ├── seeds/
│   │   ├── seedAdmin.js          # Admin account seed script (env-driven)
│   │   └── seedProducts.js       # Initial Hi Suvai products seed script
│   ├── .env.example              # Sample environment configuration template
│   ├── server.js                 # Express server with trust proxy, CORS, rate limits & security headers
│   └── package.json              # Backend dependencies
│
├── public/                       # Deployed Static Frontend (Netlify publish root)
│   ├── index.html                # Main storefront with dynamic bento grid, cart & checkout
│   ├── account.html              # Customer account portal (orders, tracking, address book)
│   ├── track-order.html          # Public order tracking portal (with phone verification)
│   ├── privacy-policy.html       # Legal policy page
│   ├── terms-conditions.html     # Terms of service
│   ├── shipping-policy.html      # Shipping policy
│   ├── return-policy.html        # Return and cancellation policy
│   ├── favicon.ico               # Real multi-resolution icon (16x16, 32x32, 48x48)
│   ├── _redirects                # Netlify rewrite rules (routes /api/* to backend API)
│   ├── kkadmin/                  # Secure Admin Panel
│   │   ├── index.html            # Admin dashboard, product manager, orders & customer tables
│   │   ├── admin.css             # Luxury royal dark & gold theme
│   │   └── admin.js              # Admin controller (all API requests authenticated via JWT)
│   └── assets/                   # Optimized WebP images (< 400KB), brand media, and icons
│
├── netlify.toml                  # Netlify deployment configuration (publishes "public")
├── package.json                  # Root npm scripts
└── README.md                     # Documentation
```

---

## ⚙️ Environment Variables

Create `backend/.env` based on `backend/.env.example`.

> [!IMPORTANT]
> **No Default Credentials**: Default passwords are not included in source code. All secrets, admin passwords, and API keys must be set in your `.env` file before starting the server.

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hi_suvai?retryWrites=true&w=majority
JWT_SECRET=your_32_byte_hex_secret_key_generate_with_openssl_rand_hex_32
JWT_EXPIRES_IN=7d
TRUST_PROXY=1

# Initial Admin Credentials (Set a strong, unique password)
ADMIN_NAME=Rajaselvi
ADMIN_EMAIL=admin@hisuvai.com
ADMIN_PASSWORD=YourStrongUniquePasswordHere

# Allowed CORS Origins (Comma-separated)
CLIENT_URL=https://www.hisuvai.com,https://hisuvai.com,http://localhost:5000

# Razorpay Payment Gateway Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## 🚀 Deployment Guide

### Option 1: Frontend on Netlify + Backend on Node.js Server (DigitalOcean, AWS, Render)

#### 1. Deploy Frontend to Netlify:
- **Build settings**:
  - Base directory: `/`
  - Publish directory: `public`
  - Build command: *(leave empty or `echo "Static build"`)*
- `public/_redirects` will automatically proxy all `/api/*` calls to your backend API server:
  ```text
  /api/*  https://api.hisuvai.com/api/:splat  200
  ```

#### 2. Deploy Backend Server:
- Install dependencies and start with PM2:
  ```bash
  cd backend
  npm install --production
  pm2 start server.js --name "hisuvai-api"
  ```
- If running behind Nginx / Cloudflare, ensure reverse proxy sets standard proxy headers (`X-Forwarded-For`, `X-Forwarded-Proto`). Setting `TRUST_PROXY=1` in `backend/.env` ensures rate limiting accurately tracks customer client IPs.

### Option 2: Monolithic Node.js Deployment (Single Droplet / VM)

Run the backend server directly, and Express will serve both the `/public` static storefront and `/kkadmin` portal:

```bash
cd backend
npm install
npm start
```
- Customer Storefront: `http://localhost:5000/`
- Admin Panel: `http://localhost:5000/kkadmin`
- API Health Check: `http://localhost:5000/api/health`

---

## 🛡️ Security Hardening & Implementation Highlights

1. **Role-Based Access Control**:
   - `protectAdmin`: Validates JWT tokens containing `{ role: 'admin' }` for all administrative routes, product modifications, settings, banners, and stats.
   - `protectCustomer`: Validates customer JWTs for personal orders, customer address management, and self-service cancellations.
2. **Order Price & Stock Integrity**:
   - Order pricing is recalculated and enforced server-side from product database records. Client-provided subtotals or discounts are ignored.
   - Atomic inventory stock validation and deduction preventing overselling.
3. **Self-Service Order Cancellation**:
   - Customers can cancel their own orders within 24 hours of placement.
   - Strict ownership check prevents cancelling other customers' orders (`403 Forbidden`).
4. **Phone-Verified Order Tracking**:
   - Tracking by Order ID requires supplying the associated customer phone number to protect customer privacy and shipping addresses.
5. **Rate Limiting & Proxy Trust**:
   - Rate limiting configured with `app.set('trust proxy', TRUST_PROXY)` preventing IP spoofing via headers.
6. **Input Sanitization & XSS Defense**:
   - Regular expressions in product and customer search are escaped to prevent ReDoS attacks.
   - All innerHTML templates in storefront, account, tracking, and admin dashboard utilize `escapeHtml` helpers to neutralize XSS vectors.
7. **Asset Optimization**:
   - All large PNG / JPG imagery converted to WebP (< 400KB).
   - Real multi-resolution `favicon.ico` (16x16, 32x32, 48x48).