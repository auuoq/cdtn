'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DepositTransaction extends Model {
        static associate(models) {
            // Associations (nếu cần): ví dụ liên kết với BookingPackage, ExamPackage, Clinic
            DepositTransaction.belongsTo(models.Clinic, {
                foreignKey: 'clinicId',
                as: 'clinicInfo'
            });
            DepositTransaction.belongsTo(models.BookingPackage, {
                foreignKey: 'bookingId',
                as: 'bookingInfo'
            });
            DepositTransaction.belongsTo(models.ExamPackage, {
                foreignKey: 'packageId',
                as: 'packageInfo'
            });
        }
    }

    DepositTransaction.init({
        bookingId: DataTypes.INTEGER,
        clinicId: DataTypes.INTEGER,
        packageId: DataTypes.INTEGER,
        amount: DataTypes.INTEGER,
        status: DataTypes.STRING, // PAID, SETTLED, etc.
        paymentTime: DataTypes.DATE,
        payType: DataTypes.STRING,
        momoTransId: DataTypes.STRING,
        partnerCode: DataTypes.STRING,
        orderId: DataTypes.STRING,
        requestId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'DepositTransaction',
        freezeTableName: true,
    });

    return DepositTransaction;
};
