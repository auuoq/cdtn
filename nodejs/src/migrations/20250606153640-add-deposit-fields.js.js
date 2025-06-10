'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm vào ExamPackage
    await queryInterface.addColumn('ExamPackage', 'isDepositRequired', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('ExamPackage', 'depositPercent', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    });

    // Thêm vào BookingPackage
    await queryInterface.addColumn('BookingPackage', 'depositAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn('BookingPackage', 'depositStatus', {
      type: Sequelize.STRING,
      allowNull: true, // Hoặc false nếu bạn muốn bắt buộc
      defaultValue: 'UNPAID', // Có thể là 'PAID' hoặc 'UNPAID'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa các cột đã thêm nếu rollback
    await queryInterface.removeColumn('ExamPackage', 'isDepositRequired');
    await queryInterface.removeColumn('ExamPackage', 'depositPercent');

    await queryInterface.removeColumn('BookingPackage', 'depositAmount');
    await queryInterface.removeColumn('BookingPackage', 'depositStatus');
  }
};
