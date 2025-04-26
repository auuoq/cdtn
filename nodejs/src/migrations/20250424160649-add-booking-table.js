'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Bookings', 'packageId', {
      type: Sequelize.INTEGER,
      allowNull: true,  // Được phép null nếu là lịch khám bác sĩ
    });

    await queryInterface.addColumn('Bookings', 'feedback', {
      type: Sequelize.STRING,
      allowNull: true,  // Được phép null nếu chưa có đánh giá
    });

    await queryInterface.addColumn('Bookings', 'diagnosis', {
      type: Sequelize.STRING,
      allowNull: true,  // Được phép null nếu bác sĩ chưa điền chẩn đoán
    });

    // Cập nhật doctorId để có thể nhận giá trị null
    await queryInterface.changeColumn('Bookings', 'doctorId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Chấp nhận null cho doctorId khi đặt lịch gói khám
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Bookings', 'packageId');
    await queryInterface.removeColumn('Bookings', 'feedback');
    await queryInterface.removeColumn('Bookings', 'diagnosis');
    await queryInterface.changeColumn('Bookings', 'doctorId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Nếu bạn muốn không cho phép doctorId là null
    });
  }
};
