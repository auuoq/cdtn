'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('bookings', 'isDisplayed', {
            type: Sequelize.BOOLEAN,
            defaultValue: false, // mặc định hiển thị
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('bookings', 'isDisplayed');
    }
};
