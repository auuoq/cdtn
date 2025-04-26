'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ExamPackage extends Model {
        static associate(models) {
            ExamPackage.belongsTo(models.Allcode, { foreignKey: 'provinceId', targetKey: 'keyMap', as: 'provinceTypeData' });
            ExamPackage.belongsTo(models.Allcode, { foreignKey: 'paymentId', targetKey: 'keyMap', as: 'paymentTypeData' });
            ExamPackage.belongsTo(models.Allcode, { foreignKey: 'categoryId', targetKey: 'keyMap', as: 'categoryTypeData' });
            ExamPackage.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinicInfo' });
        }
    };

    ExamPackage.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clinicId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        provinceId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contentHTML: DataTypes.TEXT('long'),
        contentMarkdown: DataTypes.TEXT('long'),
        description: DataTypes.TEXT('long'),
        image: DataTypes.TEXT,
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'ExamPackage',
        freezeTableName: true,
        timestamps: true,
    });

    return ExamPackage;
};
