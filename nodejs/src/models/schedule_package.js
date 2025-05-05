'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SchedulePackage extends Model {
    static associate(models) {
      SchedulePackage.belongsTo(models.ExamPackage, {
        foreignKey: 'packageId',
        as: 'packageInfo'
      });
      SchedulePackage.belongsTo(models.Allcode, {
        foreignKey: 'timeType',
        targetKey: 'keyMap',
        as: 'timeTypeData'
      });
    }
  }
  SchedulePackage.init({
    packageId: DataTypes.INTEGER,
    date: DataTypes.STRING,
    timeType: DataTypes.STRING,
    maxNumber: DataTypes.INTEGER,
    currentNumber: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SchedulePackage',
    freezeTableName: true,
  });
  return SchedulePackage;
};
