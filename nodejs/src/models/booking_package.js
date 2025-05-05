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
        as: 'timeTypeData'
      });
      BookingPackage.belongsTo(models.Allcode, {
        foreignKey: 'statusId',
        targetKey: 'keyMap',
        as: 'statusData'
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
    diagnosis: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BookingPackage',
    freezeTableName: true,
  });
  return BookingPackage;
};
