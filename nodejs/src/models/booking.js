'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Booking.belongsTo(models.User,
                {
                    foreignKey: 'patientId', targetKey: 'id', as: 'patientData'
                })
            Booking.belongsTo(models.Allcodes,
                {
                    foreignKey: 'timeType', targetKey: 'keyMap',
                    as: 'timeTypeDataPatient'
                })
            Booking.belongsTo(models.User,
                {
                    foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData'
                }) 
            Booking.belongsTo(models.Allcodes,
                {
                    foreignKey: 'statusId', targetKey: 'keyMap', as: 'statusIdDataPatient'
                })  
            Booking.belongsTo(models.DoctorInfor,
                {
                    foreignKey: 'doctorId', targetKey: 'doctorId', as: 'doctorBooking'
                })
                
        }
    };
    Booking.init({
        statusId: DataTypes.STRING,
        doctorId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        date: DataTypes.STRING,
        timeType: DataTypes.STRING,
        reason: DataTypes.STRING,
        token: DataTypes.STRING,
        feedback: DataTypes.STRING,
        diagnosis: DataTypes.STRING,
        isDisplayed: DataTypes.BOOLEAN,
        remedyImage: DataTypes.TEXT,
        qrCode: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Booking',
        freezeTableName: true
    });
    return Booking;
};
