import db from "../models/index";

let createExamPackage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.categoryId || !data.clinicId || !data.price || !data.provinceId || !data.paymentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            // Kiểm tra quyền quản lý phòng khám
            // const clinicManager = await db.Clinic_Manager.findOne({
            //     where: { userId: data.userId, clinicId: data.clinicId }
            // });

            // if (!clinicManager) {
            //     resolve({
            //         errCode: 2,
            //         errMessage: 'You are not authorized to create an exam package for this clinic'
            //     });
            //     return;
            // }

            let examPackage = await db.ExamPackage.create({
                name: data.name,
                categoryId: data.categoryId,
                clinicId: data.clinicId,
                price: data.price,
                provinceId: data.provinceId,
                paymentId: data.paymentId,
                descriptionMarkdown: data.descriptionMarkdown,
                descriptionHTML: data.descriptionHTML,
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

let updateExamPackage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.packageId || !data.name || !data.clinicId || !data.price || !data.provinceId || !data.paymentId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            // const clinicManager = await db.Clinic_Manager.findOne({
            //     where: { clinicId: data.clinicId, userId: data.userId }
            // });

            // if (!clinicManager) {
            //     return resolve({
            //         errCode: 2,
            //         errMessage: 'You do not have permission to manage this clinic'
            //     });
            // }

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
        } catch (error) {
            reject(error);
        }
    });
};

let deleteExamPackage = (packageId) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            console.log(packageId)
            if(!packageId){
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            }
            
            let idpackage = await db.ExamPackage.findOne({
                where: {id: packageId}
            })
    
            if(!idpackage){
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic not found'
                })
            }
    
            else{
                await db.ExamPackage.destroy({
                    where: {id: packageId}
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

let getExamPackagesDetailByClinic = (clinicId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!clinicId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            let data = await db.ExamPackage.findAll({
                where: { clinicId: clinicId }
            });

            if (data && data.length > 0) {
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
    getExamPackagesDetailByClinic
};
