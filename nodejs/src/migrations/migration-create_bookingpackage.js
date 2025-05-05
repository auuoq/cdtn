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
