require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminName = process.env.ADMIN_NAME || 'Hi Suvai Admin';
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      console.error('[Seed Error]: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
      process.exit(1);
    }

    // Check if an admin already exists (NEVER overwrite existing password)
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin already exists: ${adminEmail} (Role: ${existingAdmin.role}). Password untouched.`);
    } else {
      const newAdmin = new Admin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin'
      });

      await newAdmin.save();
      console.log(`\n========================================`);
      console.log(`[Seed] Admin Account Created Successfully!`);
      console.log(`Email   : ${adminEmail}`);
      console.log(`Role    : superadmin`);
      console.log(`========================================\n`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
