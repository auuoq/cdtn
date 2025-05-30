import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let createExamPackage = (data, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const Clinic_Manager = await db.Clinic_Manager.findOne({
                where: { userId },
                attributes: ['clinicId']
            });
            if (!Clinic_Manager || !data.name || !data.categoryId || !data.price || !data.provinceId || !data.paymentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            let examPackage = await db.ExamPackage.create({
                name: data.name,
                categoryId: data.categoryId,
                clinicId: Clinic_Manager.clinicId,
                price: data.price,
                provinceId: data.provinceId,
                paymentId: data.paymentId,
                contentMarkdown: data.contentMarkdown,
                contentHTML: data.contentHTML,
                description: data.description,
                image: data.imageBase64,
                note: data.note
            });

            resolve({
                errCode: 0,
                errMessage: 'Create new exam package succeed!',
                data: examPackage
            });
        } catch (error) {
            reject(error);
        }
    });
};

let updateExamPackage = (data, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.packageId || !data.name || !data.clinicId || !data.price || !data.provinceId || !data.paymentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            }
            let examPackage = await db.ExamPackage.findOne({
                where: { id: data.packageId, clinicId: data.clinicId },
                raw: false
            });

            if (examPackage) {
                examPackage.name = data.name;
                examPackage.categoryId = data.categoryId;
                examPackage.price = data.price;
                examPackage.provinceId = data.provinceId;
                examPackage.paymentId = data.paymentId;
                examPackage.contentMarkdown = data.contentMarkdown;
                examPackage.contentHTML = data.contentHTML;
                examPackage.description = data.description;
                examPackage.note = data.note;

                if (data.imageBase64) {
                    examPackage.image = data.imageBase64;
                }

                await examPackage.save();

                resolve({
                    errCode: 0,
                    errMessage: 'Update exam package succeed!',
                    data: examPackage
                });
            } else {
                resolve({
                    errCode: 3,
                    errMessage: 'Exam package not found'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let deleteExamPackage = (packageId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(packageId)
            if (!packageId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            }

            let idpackage = await db.ExamPackage.findOne({
                where: { id: packageId }
            })

            if (!idpackage) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic not found'
                })
            }

            else {
                await db.ExamPackage.destroy({
                    where: { id: packageId }
                })
                return resolve({
                    errCode: 0,
                    errMessage: 'Clinic deleted successfully!'
                })

            }
        } catch (e) {
            reject(e)

        }

    })
}

let getAllExamPackages = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let packages = await db.ExamPackage.findAll();

            if (packages && packages.length > 0) {
                packages = packages.map(item => {
                    if (item.image) {
                        item.image = new Buffer(item.image, 'base64').toString('binary');
                    }
                    return item;
                });
            }

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: packages
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getExamPackagesDetailByManager = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing userId parameter'
                });
                return;
            }

            // Lấy clinicId mà user đang quản lý
            let manager = await db.Clinic_Manager.findOne({
                where: { userId },
                attributes: ['clinicId']
            });

            if (!manager) {
                resolve({
                    errCode: 2,
                    errMessage: 'No clinic found for this manager'
                });
                return;
            }

            // Truy vấn tất cả các gói khám thuộc clinicId và include thông tin phòng khám
            let packages = await db.ExamPackage.findAll({
                where: { clinicId: manager.clinicId },
                include: [
                    {
                        model: db.Clinic,
                        as: 'clinicInfo',
                        attributes: ['name', 'address', 'image']
                    }
                ]
            });

            if (packages && packages.length > 0) {
                packages = packages.map(item => {
                    if (item.image) {
                        item.image = new Buffer(item.image, 'base64').toString('binary');
                    }
                    if (item.clinicInfo && item.clinicInfo.image) {
                        item.clinicInfo.image = new Buffer(item.clinicInfo.image, 'base64').toString('binary');
                    }
                    return item;
                });
            }

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: packages
            });

        } catch (error) {
            reject(error);
        }
    });
};





let bulkCreateScheduleForPackage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.packageId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                });
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.currentNumber = 0;
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    });
                }

                // Lấy tất cả các lịch khám đã tồn tại
                let existing = await db.SchedulePackage.findAll({
                    where: { packageId: data.packageId, date: data.formatedDate },
                    attributes: ['id', 'timeType', 'date', 'packageId', 'maxNumber'],
                    raw: true
                });

                // Lấy các lịch cần tạo mới (những lịch không tồn tại trong DB)
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });

                // Lấy các lịch cần xóa (những lịch đã tồn tại nhưng không có trong lần chọn mới)
                let toDelete = _.differenceWith(existing, schedule, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });

                // Xóa những lịch cũ không còn trong lần chọn hiện tại
                if (toDelete && toDelete.length > 0) {
                    let idsToDelete = toDelete.map(item => item.id);
                    await db.SchedulePackage.destroy({
                        where: { id: idsToDelete }
                    });
                }

                // Tạo những lịch khám mới
                if (toCreate && toCreate.length > 0) {
                    await db.SchedulePackage.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getDetailExamPackageById = (packageId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!packageId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: packageId',
                });
                return;
            }

            let data = await db.ExamPackage.findOne({
                where: { id: packageId },
                include: [
                    {
                        model: db.Allcode,
                        as: 'provinceTypeData',
                        attributes: ['valueEn', 'valueVi'],
                    },
                    {
                        model: db.Allcode,
                        as: 'paymentTypeData',
                        attributes: ['valueEn', 'valueVi'],
                    },
                    {
                        model: db.Allcode,
                        as: 'categoryTypeData',
                        attributes: ['valueEn', 'valueVi'],
                    },
                    {
                        model: db.Clinic,
                        as: 'clinicInfo',
                        attributes: ['name', 'address'],
                    }
                ],
                raw: false,
                nest: true
            });

            if (data && data.image) {
                data.image = new Buffer(data.image, 'base64').toString('binary');
            }

            if (!data) {
                resolve({
                    errCode: 2,
                    errMessage: 'Exam package not found',
                });
            } else {
                resolve({
                    errCode: 0,
                    errMessage: 'ok',
                    data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getSchedulePackageByDate = (packageId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!packageId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                });
            } else {
                let dataSchedule = await db.SchedulePackage.findAll({
                    where: {
                        packageId: packageId,
                        date: date
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: 'timeTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.ExamPackage,
                            as: 'packageInfo',
                            attributes: ['name', 'price']
                        }
                    ],
                    attributes: ['currentNumber', 'maxNumber', 'timeType', 'date', 'packageId'],
                    raw: false,
                    nest: true
                });
                if (!dataSchedule) dataSchedule = [];

                resolve({
                    errCode: 0,
                    data: dataSchedule
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getListAllExamPackagePatientWithStatusS3 = (packageId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!packageId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                let data = await db.BookingPackage.findAll({
                    where: {
                        statusId: 'S3',
                        packageId: packageId
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'lastName', 'address', 'gender'],
                            include: [
                                {
                                    model: db.Allcode,
                                    as: 'genderData',
                                    attributes: ['valueVi', 'valueEn']
                                }
                            ]
                        },
                        {
                            model: db.Allcode,
                            as: 'timeTypeData',
                            attributes: ['valueVi', 'valueEn']
                        },
                        {
                            model: db.ExamPackage,
                            as: 'packageData',
                            attributes: ['name', 'price'],
                            include: [
                                {
                                    model: db.Clinic,
                                    as: 'clinicInfo',
                                    attributes: ['name', 'address']
                                }
                            ]
                        }
                    ],
                    raw: false,
                    nest: true
                });

                resolve({
                    errCode: 0,
                    data: data
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};



module.exports = {
    createExamPackage,
    updateExamPackage,
    deleteExamPackage,
    getAllExamPackages,
    getExamPackagesDetailByManager,
    bulkCreateScheduleForPackage,
    getDetailExamPackageById,
    getSchedulePackageByDate,
    getListAllExamPackagePatientWithStatusS3
};
