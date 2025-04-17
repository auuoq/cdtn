'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Clinic_Manager extends Model {
    static associate(models) {
      Clinic_Manager.belongsTo(models.User, { foreignKey: 'userId', as: 'manager' });
      Clinic_Manager.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    }
  }

  Clinic_Manager.init({
    userId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Clinic_Manager',
  });

  return Clinic_Manager;
};
