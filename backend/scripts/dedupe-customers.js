require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const connectDB = require('../config/db');

async function dedupeCustomers() {
  console.log('====================================================');
  console.log('🔍 Hi Suvai Customer Email Duplicate Audit Tool');
  console.log('   (Read-Only: Lists duplicates without deleting)');
  console.log('====================================================\n');

  try {
    await connectDB();

    const duplicates = await Customer.aggregate([
      {
        $project: {
          emailLower: { $toLower: { $trim: { input: '$email' } } },
          name: 1,
          phone: 1,
          hasPassword: {
            $cond: [
              { $and: [{ $ne: ['$password', null] }, { $ne: ['$password', ''] }] },
              true,
              false
            ]
          },
          createdAt: 1
        }
      },
      {
        $match: {
          emailLower: { $ne: '' }
        }
      },
      {
        $group: {
          _id: '$emailLower',
          count: { $sum: 1 },
          records: {
            $push: {
              id: '$_id',
              name: '$name',
              phone: '$phone',
              hasPassword: '$hasPassword',
              createdAt: '$createdAt'
            }
          }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate customer emails found in the database.');
      console.log('   The unique index on Customer.email can be safely applied.\n');
    } else {
      console.log(`⚠️ Found ${duplicates.length} email address(es) with multiple customer accounts:\n`);

      duplicates.forEach((item, index) => {
        console.log(`[#${index + 1}] Email: "${item._id}" (Duplicate Count: ${item.count})`);
        item.records.forEach((rec, rIdx) => {
          console.log(`    ${rIdx + 1}. ID: ${rec.id} | Name: "${rec.name}" | Phone: "${rec.phone}" | Has Password: ${rec.hasPassword ? 'Yes' : 'No'} | Created: ${rec.createdAt || 'N/A'}`);
        });
        console.log('');
      });

      console.log('ℹ️ Recommendation: Consolidate or remove the redundant customer IDs above before creating the unique index.');
    }
  } catch (error) {
    console.error('❌ Error during deduplication scan:', error.message);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed.');
    } catch (e) {}
    process.exit(0);
  }
}

dedupeCustomers();
