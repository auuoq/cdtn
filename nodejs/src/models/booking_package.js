'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingPackage extends Model {
    static associate(models) {
      BookingPackage.belongsTo(models.ExamPackage, {
        foreignKey: 'packageId',
        as: 'packageData'
      });
      BookingPackage.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'patientData'
      });
      BookingPackage.belongsTo(models.Allcode, {
        foreignKey: 'timeType',
        targetKey: 'keyMap',
        as: 'timeTypeDataPatient'
      });
      BookingPackage.belongsTo(models.Allcode, {
        foreignKey: 'statusId',
        targetKey: 'keyMap',
        as: 'statusIdDataPatient'
      });
    }
  }
  BookingPackage.init({
    packageId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    date: DataTypes.STRING,
    timeType: DataTypes.STRING,
    statusId: DataTypes.STRING,
    reason: DataTypes.STRING,
    token: DataTypes.STRING,
    feedback: DataTypes.STRING,
    diagnosis: DataTypes.STRING,
    isDisplayed: DataTypes.BOOLEAN,
    remedyImage: DataTypes.TEXT,
    depositStatus: DataTypes.STRING,
    depositAmount: DataTypes.INTEGER,
    qrCode: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'BookingPackage',
    freezeTableName: true,
  });
  return BookingPackage;
};
