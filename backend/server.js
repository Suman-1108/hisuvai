const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const settingRoutes = require('./routes/settingRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const Admin = require('./models/Admin');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Setting = require('./models/Setting');
const Banner = require('./models/Banner');

const app = express();
const PORT = process.env.PORT || 5000;

// Enforce mandatory environment variables for production security
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'MONGO_URI'];
const missingEnv = REQUIRED_ENV_VARS.filter(key => !process.env[key] || !process.env[key].trim());
if (missingEnv.length > 0) {
  console.error(`\n❌ FATAL CONFIGURATION ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('The server cannot start securely without these variables. Please configure backend/.env.\n');
  process.exit(1);
}

// Ensure upload directories exist
['products', 'settings', 'banners'].forEach(folder => {
  const dir = path.join(__dirname, 'uploads', folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Auto-seed helper on bootstrap
const autoSeedInitialData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = new Admin({
        name: process.env.ADMIN_NAME || 'Rajaselvi',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin'
      });
      await admin.save();
      console.log(`[Auto-Seed] Initial admin account created: ${adminEmail}`);
    } else {
      console.log(`[Auto-Seed] Admin account verified: ${adminEmail}`);
    }

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      const initialProducts = [
        {
          name: '24 Ingredient Health Mix',
          slug: '24-ingredient-health-mix',
          tag: 'Daily Nutrition',
          shortDescription: '24 பாரம்பரிய தானியங்கள், பருப்புகள் & நட்ஸ் கலவை — 250g',
          description: 'A powerhouse blend of 24 traditional grains, millets, nuts, and pulses ground together using cold-process stone grinding. Perfect daily breakfast porridge suitable for growing kids, adults, and seniors seeking wholesome energy.',
          price: 175,
          originalPrice: 220,
          category: 'health',
          stock: 75,
          unit: '250g',
          image: 'assets/suvai1.png',
          images: ['assets/suvai1.png', 'assets/suvai4.png'],
          isFeatured: true,
          isAvailable: true,
          rating: 4.9,
          reviewsCount: 148
        },
        {
          name: 'Traditional Double Combo',
          slug: 'traditional-double-combo',
          tag: 'Combo Deal',
          shortDescription: 'ஆரோக்கிய மிக்ஸ் + பாரம்பரிய கஞ்சி மிக்ஸ் சிறப்பு காம்போ',
          description: 'Value pack combining our best-selling 24 Ingredient Health Mix and 16 Variety Heritage Porridge Mix. Crafted for complete family wellness with 100% natural, preservative-free South Indian ingredients.',
          price: 275,
          originalPrice: 350,
          category: 'combo',
          stock: 40,
          unit: '500g (2 Packs)',
          image: 'assets/suvai2.png',
          images: ['assets/suvai2.png', 'assets/suvai1.png', 'assets/suvai3.png'],
          isFeatured: true,
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 210
        },
        {
          name: '16 Variety Porridge Mix',
          slug: '16-variety-porridge-mix',
          tag: 'Heritage Rice',
          shortDescription: '16 பாரம்பரிய அரிசி மற்றும் தானியங்கள் கலந்த சத்துணவு கஞ்சி',
          description: 'A comforting blend of 16 ancient Tamil rice varieties including Karuppu Kavuni, Mappillai Samba, and Kattu Yanam. High in dietary fibre and rich in antioxidants to keep digestion calm and active throughout the day.',
          price: 100,
          originalPrice: 130,
          category: 'porridge',
          stock: 90,
          unit: '250g',
          image: 'assets/suvai3.png',
          images: ['assets/suvai3.png', 'assets/suvai5.png'],
          isFeatured: true,
          isAvailable: true,
          rating: 4.8,
          reviewsCount: 96
        },
        {
          name: 'Hi Suvai Health Mix',
          slug: 'hi-suvai-health-mix',
          tag: 'Daily Health',
          shortDescription: 'முழுமையான இயற்கை சத்து மாவு — நாள் முழுவதும் புத்துணர்ச்சி',
          description: 'Traditional multi-grain health malt enriched with sprouted ragi, green gram, almonds, and cardamom. Easily digestible and naturally sweetened with no added artificial flavours or white sugar.',
          price: 175,
          originalPrice: 220,
          category: 'health',
          stock: 65,
          unit: '250g',
          image: 'assets/suvai4.png',
          images: ['assets/suvai4.png', 'assets/suvai1.png'],
          isFeatured: true,
          isAvailable: true,
          rating: 4.9,
          reviewsCount: 112
        },
        {
          name: 'Heritage Rice Porridge',
          slug: 'heritage-rice-porridge',
          tag: 'Power Grains',
          shortDescription: 'பாரம்பரிய கறுப்பு கவுனி & காட்டுயானம் அரிசி கஞ்சி கலவை',
          description: 'Specially milled ancient Tamil heritage rice recipe crafted for sustained stamina and immunity. Delicious with fresh buttermilk, a pinch of sea salt, and shallots.',
          price: 100,
          originalPrice: 130,
          category: 'porridge',
          stock: 80,
          unit: '250g',
          image: 'assets/suvai5.png',
          images: ['assets/suvai5.png', 'assets/suvai3.png'],
          isFeatured: true,
          isAvailable: true,
          rating: 4.8,
          reviewsCount: 84
        },
        {
          name: 'Karuppu Gothumai Flour',
          slug: 'karuppu-gothumai-flour',
          tag: 'Special Flour',
          shortDescription: 'இயற்கை கருப்பு கோதுமை மாவு — சத்துக்கள் நிறைந்த சுவை',
          description: '100% stone-milled Black Wheat (Karuppu Gothumai) Flour with natural anthocyanins and rich fibre. Ideal for nutritious chapatis, rotis, and traditional South Indian tiffin items.',
          price: 150,
          originalPrice: 190,
          category: 'flour',
          stock: 50,
          unit: '500g',
          image: 'assets/suvai6.png',
          images: ['assets/suvai6.png'],
          isFeatured: true,
          isAvailable: true,
          rating: 4.9,
          reviewsCount: 68
        }
      ];
      await Product.insertMany(initialProducts);
      console.log('[Auto-Seed] Initial 6 Hi Suvai products loaded into database.');
    }
  } catch (err) {
    console.warn('[Auto-Seed Warning]:', err.message);
  }
};

// Trust proxy setting before rate limiters (configurable via env TRUST_PROXY, defaults to 1)
const trustProxyVal = process.env.TRUST_PROXY;
if (trustProxyVal !== undefined) {
  const parsed = parseInt(trustProxyVal, 10);
  app.set('trust proxy', isNaN(parsed) ? (trustProxyVal === 'true' ? true : (trustProxyVal === 'false' ? false : trustProxyVal)) : parsed);
} else {
  app.set('trust proxy', 1);
}

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiters:
// admin/customer login 10 per 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// POST /api/orders 20 per min
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order attempts from this IP. Please wait a minute before trying again.'
  }
});

// Helmet Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allows inline scripts for frontend & payment gateway checkout
}));

// CORS Configuration - Restrict to CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === 'null') return callback(null, true);
    const clean = origin.trim().replace(/\/+$/, '');
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(clean) ||
      clean.startsWith('http://localhost') ||
      clean.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static Files: Uploads, Public Frontend & Admin Portal
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// Smart fallback for missing /uploads files to prevent 404 broken images
app.use('/uploads/products', (req, res, next) => {
  const fallback = path.join(publicDir, 'assets', 'suvai1.png');
  if (fs.existsSync(fallback)) return res.sendFile(fallback);
  next();
});

app.use('/uploads/banners', (req, res, next) => {
  const fallback = path.join(publicDir, 'assets', 'hero-cereals-dy3wvrdu.png');
  if (fs.existsSync(fallback)) return res.sendFile(fallback);
  next();
});

app.use('/uploads/settings', (req, res, next) => {
  const fallback = path.join(publicDir, 'assets', 'offer_1.jpg');
  if (fs.existsSync(fallback)) return res.sendFile(fallback);
  next();
});

// Serve static assets from /public/assets
app.use('/assets', express.static(path.join(publicDir, 'assets')));
app.use('/kkadmin/assets', express.static(path.join(publicDir, 'assets')));

// Route any stray /kkadmin/banner-* or /kkadmin/product-* requests to their proper uploads directory
app.use('/kkadmin', (req, res, next) => {
  if (req.path.startsWith('/banner-slot-')) {
    const filename = req.path.replace(/^\//, '');
    const bannerPath = path.join(__dirname, 'uploads', 'banners', filename);
    if (fs.existsSync(bannerPath)) return res.sendFile(bannerPath);
    return res.sendFile(path.join(publicDir, 'assets', 'hero-cereals-dy3wvrdu.png'));
  }
  if (req.path.startsWith('/product-')) {
    const filename = req.path.replace(/^\//, '');
    const prodPath = path.join(__dirname, 'uploads', 'products', filename);
    if (fs.existsSync(prodPath)) return res.sendFile(prodPath);
    return res.sendFile(path.join(publicDir, 'assets', 'suvai1.png'));
  }
  next();
});

// Serve ONLY /public as static frontend (never expose root or backend/*.js!)
app.use(express.static(publicDir));
app.use('/kkadmin', express.static(path.join(publicDir, 'kkadmin')));

// Apply rate limiting to login endpoints
app.use('/api/auth/login', loginLimiter);
app.use('/api/customers/login', loginLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Hi Suvai Backend API'
  });
});

// Chrome DevTools probe handler to prevent console warnings
app.get('/.well-known/*', (req, res) => {
  res.status(204).end();
});

// Admin Route redirect (Redirect /admin to home for security)
app.get('/admin', (req, res) => {
  res.redirect('/');
});
app.get(['/kkadmin', '/kkadmin/'], (req, res) => {
  res.sendFile(path.join(publicDir, 'kkadmin', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server with EADDRINUSE handling (fails immediately in production)
const startServer = async () => {
  try {
    await connectDB();
    await autoSeedInitialData();

    let targetPort = parseInt(PORT, 10) || 5000;

    const createServerOnPort = (p) => {
      const server = app.listen(p, '0.0.0.0');

      server.on('listening', () => {
        console.log(`\n🚀 Hi Suvai Server running on port ${p}`);
        console.log(`👉 Customer Website: http://127.0.0.1:${p}/`);
        console.log(`👉 Admin Portal    : http://127.0.0.1:${p}/kkadmin`);
        console.log(`👉 API Health Check: http://127.0.0.1:${p}/api/health\n`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          if (process.env.NODE_ENV === 'production') {
            console.error(`\n❌ FATAL: Port ${p} is already in use. Exiting in production mode.\n`);
            process.exit(1);
          } else {
            console.warn(`⚠️ Port ${p} is in use. Trying port ${p + 1}...`);
            createServerOnPort(p + 1);
          }
        } else {
          console.error('Failed to start server:', err);
          process.exit(1);
        }
      });
    };

    createServerOnPort(targetPort);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

