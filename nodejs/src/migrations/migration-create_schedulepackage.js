'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SchedulePackage', {
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
      date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      timeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      maxNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currentNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('SchedulePackage');
  }
};
