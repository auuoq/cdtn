'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BookingPackage', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      packageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ExamPackage', key: 'id' },
        onDelete: 'CASCADE'
      },
      patientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      statusId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      feedback: {
        type: Sequelize.STRING,
        allowNull: true
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: true
      },
      qrCode: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      depositAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      depositStatus: {
        type: Sequelize.STRING,
        allowNull: true, // Hoặc false nếu bạn muốn bắt buộc
        defaultValue: 'UNPAID', // Có thể là 'PAID' hoặc 'UNPAID'
      },
      isDisplayed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      remedyImage: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BookingPackage');
  }
};
