'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('DepositTransaction', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            bookingId: {
                type: Sequelize.INTEGER,
            },
            clinicId: {
                type: Sequelize.INTEGER,
            },
            packageId: {
                type: Sequelize.INTEGER,
            },
            amount: {
                type: Sequelize.INTEGER,
            },
            status: {
                type: Sequelize.STRING, // PAID, SETTLED
            },
            paymentTime: {
                type: Sequelize.DATE,
            },
            payType: {
                type: Sequelize.STRING, // momo_wallet, qr, etc.
            },
            momoTransId: {
                type: Sequelize.STRING,
            },
            partnerCode: {
                type: Sequelize.STRING,
            },
            orderId: {
                type: Sequelize.STRING,
            },
            requestId: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('DepositTransaction');
    },
};
