const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Debug: Check if MONGODB_URI is loaded
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file or Render environment variables.');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // In production, exit on DB failure
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
