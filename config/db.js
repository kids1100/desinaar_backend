const mongoose = require('mongoose');

// No need for dotenv anymore

const connectDB = async () => {
  try {
    const MONGO_URI = 'mongodb+srv://cgcosmos1100:z3wjniNCVyE03ezt@3g-cluster.qd35h.mongodb.net/Desi_naar_app';

    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
