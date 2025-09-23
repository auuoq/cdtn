const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Supabase yêu cầu SSL
    },
  },
  timezone: "+07:00",
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to Supabase has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to Supabase:', error);
  }
};

module.exports = connectDB;
