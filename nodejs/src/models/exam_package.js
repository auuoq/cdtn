'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ExamPackage extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Định nghĩa các mối quan hệ
            ExamPackage.belongsTo(models.Allcode, { foreignKey: 'provinceId', targetKey: 'keyMap', as: 'provinceTypeData' });
            ExamPackage.belongsTo(models.Allcode, { foreignKey: 'paymentId', targetKey: 'keyMap', as: 'paymentTypeData' });
            ExamPackage.belongsTo(models.Allcode, { foreignKey: 'categoryId', targetKey: 'keyMap', as: 'categoryTypeData' });
            ExamPackage.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinicInfo' });
        }
    };

    ExamPackage.init({
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false, // Giới hạn categoryId phải có
        },
        clinicId: {
            type: DataTypes.INTEGER,
            allowNull: false, // Giới hạn clinicId phải có
        },
        price: {
            type: DataTypes.DECIMAL(10, 2), // Thay đổi từ STRING sang DECIMAL cho giá
            allowNull: false, // Giới hạn price phải có
        },
        provinceId: {
            type: DataTypes.STRING,
            allowNull: false, // Giới hạn provinceId phải có
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: false, // Giới hạn paymentId phải có
        },
        descriptionMarkdown: DataTypes.TEXT,
        descriptionHTML: DataTypes.TEXT,
        image: DataTypes.TEXT,
        note: {
            type: DataTypes.STRING,
            allowNull: true, // Ghi chú có thể để trống
        },
    }, {
        sequelize,
        modelName: 'ExamPackage',
        freezeTableName: true, // Giữ nguyên tên bảng
        timestamps: true, // Thêm createdAt và updatedAt
    });

    return ExamPackage;
};
