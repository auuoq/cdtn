const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,          // Supabase yêu cầu SSL
      rejectUnauthorized: false,
    },
    family: 4,                 // Ép Node.js dùng IPv4
  },
  timezone: "+07:00",
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to Supabase has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to Supabase:', error);
  }
};

module.exports = connectDB;
