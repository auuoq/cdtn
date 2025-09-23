'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClinicManager extends Model {
    static associate(models) {
      ClinicManager.belongsTo(models.User, { foreignKey: 'userId', as: 'manager' });
      ClinicManager.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    }
  }

  ClinicManager.init({
    userId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ClinicManager',
    freezeTableName: true
  });

  return ClinicManager;
};
