'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('BookingPackage', 'remedyImage', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BookingPackage', 'remedyImage');
  }
};
