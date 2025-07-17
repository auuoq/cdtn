const { Sequelize } = require('sequelize');
require('dotenv').config();

// Tạo dialectOptions tùy theo DB_SSL
const dialectOptions = {
    family: 4
};

if (process.env.DB_SSL === 'true') {
    dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false
    };
}

// Tạo Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_DATABASE_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        dialectOptions: dialectOptions,
        query: {
            raw: true
        },
        timezone: "+07:00"
    }
);

// Kết nối DB
let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

module.exports = connectDB;
