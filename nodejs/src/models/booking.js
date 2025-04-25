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
            Booking.belongsTo(models.Allcode,
                {
                    foreignKey: 'timeType', targetKey: 'keyMap',
                    as: 'timeTypeDataPatient'
                })
            Booking.belongsTo(models.User,
                {
                    foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData'
                }) 
            Booking.belongsTo(models.Allcode,
                {
                    foreignKey: 'statusId', targetKey: 'keyMap', as: 'statusIdDataPatient'
                })  
            Booking.belongsTo(models.Doctor_Infor,
                {
                    foreignKey: 'doctorId', targetKey: 'doctorId', as: 'doctorBooking'
                })
            Booking.belongsTo(models.ExamPackage, 
                {
                    foreignKey: 'packageId', targetKey: 'id', as: 'examPackageData' // Link to ExamPackage
                })
        }
    };
    Booking.init({
        statusId: DataTypes.STRING,
        doctorId: {
            type: DataTypes.INTEGER,
            allowNull: true, // doctorId can be null for exam packages
        },
        patientId: DataTypes.INTEGER,
        date: DataTypes.STRING,
        timeType: DataTypes.STRING,
        reason: DataTypes.STRING,
        token: DataTypes.STRING,
        packageId: {
            type: DataTypes.INTEGER,
            allowNull: true, // packageId can be null for doctor appointments
        },
        feedback: {
            type: DataTypes.STRING,
            allowNull: true, // Feedback from patient after appointment
        },
        diagnosis: {
            type: DataTypes.STRING,
            allowNull: true, // Diagnosis from doctor after appointment
        },
    }, {
        sequelize,
        modelName: 'Booking',
    });
    return Booking;
};
