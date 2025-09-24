'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Allcodes, { foreignKey: 'positionId', targetKey: 'keyMap', as: 'positionData' })
      User.belongsTo(models.Allcodes, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' })
      User.hasOne(models.Markdown, { foreignKey: 'doctorId' })
      User.hasOne(models.DoctorInfor, { foreignKey: 'doctorId' }, { as: 'doctorInfo' })
      User.hasMany(models.Schedule, { foreignKey: 'doctorId', as: 'doctorData' })
      User.hasMany(models.Booking, { foreignKey: 'patientId', as: 'patientData' })
      User.hasMany(models.ClinicManager, { foreignKey: 'userId', as: 'managedClinics' })
      User.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });


    }
  };
  User.init({
    // id: DataTypes.INTEGER, // no need this, else code cant run (need research further)
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    address: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    image: {type: DataTypes.STRING, allowNull: true},
    roleId: DataTypes.STRING,
    positionId: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.BIGINT,
    insuranceCode: { type: DataTypes.STRING, allowNull: true },  // Mã BHYT
    idCardNumber: { type: DataTypes.STRING, allowNull: true }, // Số CMND/CCCD
    occupation: { type: DataTypes.STRING, allowNull: true },  // Nghề nghiệp
    birthDate: { type: DataTypes.DATE, allowNull: true },  // Ngày sinh
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }, // Trạng thái hoạt động
  }, {
    sequelize,
    modelName: 'User',
    freezeTableName: true
  });
  return User;
};
