const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'pratikshah2056@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        username: 'pratikadmin',
        email: adminEmail,
        password: 'Ajit@777',
        role: 'admin',
        isVerified: true,
      });
      console.log(`👑 Admin user seeded successfully: ${adminEmail}`);
    } else {
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.password = 'Ajit@777';
      await existingAdmin.save();
      console.log(`👑 Admin user credentials verified and updated: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`❌ Admin seeding error: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Seed admin credentials
    await seedAdmin();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
