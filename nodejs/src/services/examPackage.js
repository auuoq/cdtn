import db from "../models";

const createExamPackage = (data) => {
    return new Promise(async(resolve, reject) =>{
        try {
            if (!data.categoryId || !data.clinicId || !data.price || !data.provinceId || !data.paymentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            }
            else{
                const Clinic_Manager = await db.Clinic_Manager.findOne({
                    where: { userId: data.userId, clinicId: data.clinicId }
                });
            }

            if(!Clinic_Manager) {
                resolve({
                    errCode: 2,
                    errMessage: 'You are not authorized to create an exam package for this clinic'
                })
            }

            let examPackage = await db.Exam_Package.creat({
                categoryId: data.selectedcategory,
                clinicId: data.clinicId,
                price: data.price,
                provinceId: data.selectedProvince,
                paymentId: data.selectedpayment,
                descriptionMarkdown: data.descriptionMarkdown,
                descriptionHTML: data.descriptionHTML,
                image: data.imageBase64,
                note: data.note
            })

            resolve({
                errCode: 0,
                errMessage: 'Create new exam package succeed!',
                data: newExamPackage
            });
        } catch (error) {
            reject(error)
        }
    })
}

let updateExamPackage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.packageId || !data.clinicId || !data.price || !data.provinceId || !data.paymentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                // Kiểm tra quyền quản lý phòng khám
                const clinicManager = await db.Clinic_Manager.findOne({
                    where: { clinicId: data.clinicId, userId: data.userId }
                });

                if (!clinicManager) {
                    return resolve({
                        errCode: 2,
                        errMessage: 'You do not have permission to manage this clinic'
                    });
                }

                // Kiểm tra gói khám đã tồn tại hay chưa
                let examPackage = await db.ExamPackage.findOne({
                    where: { id: data.packageId, clinicId: data.clinicId },
                    raw: false // raw false allows us to update the record
                });

                if (examPackage) {
                    examPackage.categoryId = data.selectedcategory,
                    examPackage.price = data.price;
                    examPackage.provinceId = data.selectedProvince;
                    examPackage.paymentId = data.selectedpayment;
                    examPackage.descriptionMarkdown = data.descriptionMarkdown;
                    examPackage.descriptionHTML = data.descriptionHTML;
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
            }
        } catch (error) {
            reject(error);
        }
    });
};

let deleteExamPackage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.packageId || !data.clinicId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                // Kiểm tra quyền quản lý phòng khám
                const clinicManager = await db.Clinic_Manager.findOne({
                    where: { clinicId: data.clinicId, userId: data.userId }
                });

                if (!clinicManager) {
                    return resolve({
                        errCode: 2,
                        errMessage: 'You do not have permission to manage this clinic'
                    });
                }

                // Tìm gói khám và xóa
                let examPackage = await db.ExamPackage.findOne({
                    where: { id: data.packageId, clinicId: data.clinicId }
                });

                if (examPackage) {
                    await examPackage.destroy();
                    resolve({
                        errCode: 0,
                        errMessage: 'Delete exam package succeed!'
                    });
                } else {
                    resolve({
                        errCode: 3,
                        errMessage: 'Exam package not found'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllExamPackages = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let packages = await db.ExamPackage.findAll();

            if (packages && packages.length > 0) {
                // Duyệt qua tất cả các gói khám để thêm ảnh (nếu có) dưới dạng binary
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


let getExamPackageDetailByClinic = (clinicId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!clinicId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            } else {
                // Lấy chi tiết gói khám từ bảng ExamPackage theo clinicId
                let data = await db.ExamPackage.findAll({
                    where: { clinicId: clinicId }
                });

                // Kiểm tra nếu gói khám tồn tại
                if (data && data.length > 0) {
                    // Chuyển đổi ảnh BLOB thành chuỗi nhị phân (binary) nếu có
                    data.forEach(item => {
                        if (item.image) {
                            item.image = new Buffer(item.image, 'base64').toString('binary');
                        }
                    });

                    resolve({
                        errCode: 0,
                        errMessage: 'ok',
                        data
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'No exam packages found for this clinic'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};



module.exports = {
    createExamPackage,
    updateExamPackage,
    deleteExamPackage,
    getAllExamPackages,
    getExamPackageDetailByClinic
};