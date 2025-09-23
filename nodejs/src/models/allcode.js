'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Allcodes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Allcodes.hasMany(models.User, { foreignKey: 'positionId', as: 'positionData' })
            Allcodes.hasMany(models.User, { foreignKey: 'gender', as: 'genderData' })
            Allcodes.hasMany(models.Schedule, { foreignKey: 'timeType', as: 'timeTypeData' })

            Allcodes.hasMany(models.DoctorInfor, { foreignKey: 'priceId', as: 'priceTypeData' })
            Allcodes.hasMany(models.DoctorInfor, { foreignKey: 'provinceId', as: 'provinceTypeData' })
            Allcodes.hasMany(models.DoctorInfor, { foreignKey: 'paymentId', as: 'paymentTypeData' })

            Allcodes.hasMany(models.Booking, { foreignKey: 'timeType', as: 'timeTypeDataPatient' })

        }
    };

    Allcodes.init({
        keyMap: DataTypes.STRING,
        type: DataTypes.STRING,
        valueEn: DataTypes.STRING,
        valueVi: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Allcodes', 
        freezeTableName: true 
    });
    return Allcodes;
};