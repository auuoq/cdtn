const { where } = require("sequelize");
const db = require("../models");

let createClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name
                || !data.address
                || !data.imageBase64
                || !data.descriptionHTML
                || !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let updateClinic = (data) =>{
    return new Promise(async (resolve, reject) =>{
        try {
            if(!data.id || !data.name || !data.address || !data.descriptionHTML || !data.descriptionMarkdown){
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let clinic = await db.Clinic.findOne({
                where: {id: data.id},
                raw : false
            });
            if(clinic){
                clinic.name = data.name;
                clinic.address = data.address;
                clinic.descriptionHTML = data.descriptionHTML;
                clinic.descriptionMarkdown = data.descriptionMarkdown;
                if (data.imageBase64) {
                    clinic.image = data.imageBase64;
                }
                await clinic.save();

                return resolve({
                    errCode: 0,
                    errMessage: 'Clinic updated successfully!'
                })
            }

            else{
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic not found!'
                })
            }
            

        } catch (error) {
            reject(error)
        }
    });
};

let deleteClinic = (clinicId) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            if(!clinicId){
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: clinicId'
                })
            }
            
            let idClinic = await db.Clinic.findOne({
                where: {id: clinicId}
            })
    
            if(!idClinic){
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic not found'
                })
            }
    
            else{
                await db.Clinic.destroy({
                    where: {id: clinicId}
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

let getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({

            });
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'ok',
                data
            });
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailClinicById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            } else {
                let data = await db.Clinic.findOne({
                    where: { id: inputId },
                    attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown', 'image'],
                });

                if (data) {
                    // Chuyển đổi ảnh BLOB thành chuỗi nhị phân (binary)
                    if (data.image) {
                        data.image = new Buffer.from(data.image, 'base64').toString('binary');
                    }

                    // Tìm tất cả các bác sĩ liên kết với phòng khám
                    let doctorClinic = await db.Doctor_Infor.findAll({
                        where: { clinicId: inputId },
                        attributes: ['doctorId', 'provinceId'],
                    });

                    // Chuyển đối tượng Sequelize thành đối tượng JavaScript thông thường
                    let dataPlain = data.get({ plain: true });
                    dataPlain.doctorClinic = doctorClinic; // Thêm danh sách bác sĩ vào đối tượng

                    // Trả về kết quả
                    resolve({
                        errCode: 0,
                        errMessage: 'ok',
                        data: dataPlain
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'No data found',
                        data: {}
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};




module.exports = {
    createClinic: createClinic,
    updateClinic: updateClinic,
    deleteClinic: deleteClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById
}