'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      email: 'datbon180@gmail.com',
      password: '123456',
      firstName: 'Nguyen',
      lastName: 'Dat',
      address: 'VN',
      phonenumber: '0833737181',
      gender: 1,
      image: 'a',
      roleId: 'b',
      positionId: 'v',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
