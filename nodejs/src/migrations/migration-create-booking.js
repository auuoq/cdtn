'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Booking', {

            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            statusId: {
                type: Sequelize.STRING
            },
            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            patientId: {
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.STRING
            },
            timeType: {
                type: Sequelize.STRING
            },
            token: {
                type: Sequelize.STRING
            },
            reason: {   
                type: Sequelize.TEXT,
                allowNull: true,
            },
            feedback: {
                type: Sequelize.STRING,
                allowNull: true,  // Được phép null nếu chưa có đánh giá
            },
          
            diagnosis: {
                type: Sequelize.STRING,
                allowNull: true,  // Được phép null nếu bác sĩ chưa điền chẩn đoán
            },
            qrCode: {
                type: Sequelize.BLOB('long'),
                allowNull: true,
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
        await queryInterface.dropTable('Booking');
    }
};