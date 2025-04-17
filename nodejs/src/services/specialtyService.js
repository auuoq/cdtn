const db = require("../models");

let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64
                || !data.descriptionHTML || !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
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

let getAllSpecialty = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({

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

let getDetailSpecialtyById = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            } else {
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown'],
                });

                if (data) {
                    let doctorSpecialty = [];
                    if (location === "ALL") {
                        // Find all doctors for this specialty
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: { specialtyId: inputId },
                            attributes: ['doctorId', 'provinceId'],
                        });
                    } else {
                        // Find doctors by location
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId'],
                        });
                    }

                    // Create a plain object and append doctorSpecialty
                    let dataPlain = data.get({ plain: true }); // Chuyển đổi đối tượng Sequelize
                    dataPlain.doctorSpecialty = doctorSpecialty; // Thêm doctorSpecialty vào
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

let updateSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.id ||
                !data.name ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown
            ) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                });
            }

            let specialty = await db.Specialty.findOne({
                where: { id: data.id },
                raw: false
            });

            if (specialty) {
                specialty.name = data.name;
                specialty.descriptionHTML = data.descriptionHTML;
                specialty.descriptionMarkdown = data.descriptionMarkdown;
                if (data.imageBase64) {
                    specialty.image = data.imageBase64;
                }

                await specialty.save();

                return resolve({
                    errCode: 0,
                    errMessage: 'Specialty updated successfully!'
                });
            } else {
                return resolve({
                    errCode: 2,
                    errMessage: 'Specialty not found!'
                });
            }

        } catch (e) {
            reject(e);
        }
    });
};

let deleteSpecialty = (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!specialtyId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: specialtyId'
                });
            }

            let foundSpecialty = await db.Specialty.findOne({
                where: { id: specialtyId }
            });

            if (!foundSpecialty) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Specialty not found'
                });
            }

            await db.Specialty.destroy({
                where: { id: specialtyId }
            });

            return resolve({
                errCode: 0,
                errMessage: 'Specialty deleted successfully!'
            });

        } catch (e) {
            reject(e);
        }
    });
};



module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    deleteSpecialty: deleteSpecialty,
    updateSpecialty: updateSpecialty
    
}