import db from "../models/index"



let getDetailClinicByManagerUserId = async (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { userId, specialtyId, date, timeType } = query;

            if (!userId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing userId',
                    data: {}
                });
            }

            // B1: Tìm clinicId mà manager này phụ trách
            const clinicManagerRecord = await db.Clinic_Manager.findOne({
                where: { userId: userId },
                attributes: ['clinicId']
            });

            if (!clinicManagerRecord) {
                return resolve({
                    errCode: 2,
                    errMessage: 'This user is not assigned to any clinic',
                    data: {}
                });
            }

            const clinicId = clinicManagerRecord.clinicId;

            // B2: Lấy thông tin phòng khám
            const clinicData = await db.Clinic.findOne({
                where: { id: clinicId },
                attributes: ['id', 'name', 'address', 'descriptionHTML', 'descriptionMarkdown', 'image']
            });

            if (!clinicData) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Clinic not found',
                    data: {}
                });
            }

            if (clinicData.image) {
                clinicData.image = Buffer.from(clinicData.image, 'base64').toString('binary');
            }

            // B3: Lấy tất cả bác sĩ thuộc phòng khám
            let doctorFilter = { clinicId };
            if (specialtyId) {
                doctorFilter.specialtyId = specialtyId;
            }

            let doctorInfors = await db.Doctor_Infor.findAll({
                where: doctorFilter,
                attributes: ['doctorId', 'provinceId', 'specialtyId'],
            });

            // B4: Nếu có date hoặc timeType thì lọc qua Schedule
            if (date || timeType) {
                const matchedDoctorIds = [];

                for (let doc of doctorInfors) {
                    const schedule = await db.Schedule.findOne({
                        where: {
                            doctorId: doc.doctorId,
                            ...(date && { date }),
                            ...(timeType && { timeType }),
                        }
                    });

                    if (schedule) {
                        matchedDoctorIds.push(doc.doctorId);
                    }
                }

                doctorInfors = doctorInfors.filter(doc => matchedDoctorIds.includes(doc.doctorId));
            }

            // B5: Chuẩn hóa kết quả
            let dataPlain = clinicData.get({ plain: true });
            dataPlain.doctorClinic = doctorInfors;

            return resolve({
                errCode: 0,
                errMessage: 'ok',
                data: dataPlain
            });

        } catch (error) {
            console.error('Error in getDetailClinicByManagerUserId:', error);
            reject(error);
        }
    });
};

let getClinicByManager = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing userId',
                    data: {}
                });
            }

            // Tìm clinicId mà manager này phụ trách
            const clinicManagerRecord = await db.Clinic_Manager.findOne({
                where: { userId: userId },
                attributes: ['clinicId']
            });

            if (!clinicManagerRecord) {
                return resolve({
                    errCode: 2,
                    errMessage: 'This user is not assigned to any clinic',
                    data: {}
                });
            }

            const clinicId = clinicManagerRecord.clinicId;

            // Lấy thông tin phòng khám
            const clinicData = await db.Clinic.findOne({
                where: { id: clinicId },
                attributes: ['id', 'name', 'address', 'descriptionHTML', 'descriptionMarkdown', 'image']
            });

            if (!clinicData) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Clinic not found',
                    data: {}
                });
            }

            if (clinicData.image) {
                clinicData.image = Buffer.from(clinicData.image, 'base64').toString('binary');
            }

            return resolve({
                errCode: 0,
                errMessage: 'ok',
                data: clinicData
            });

        } catch (error) {
            console.error('Error in getDetailClinicByManager:', error);
            reject(error);
        }
    });
}

let getAllDoctorsByMagager = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing userId',
                    data: {}
                });
            }

            // Tìm clinicId mà manager này phụ trách
            const clinicManagerRecord = await db.Clinic_Manager.findOne({
                where: { userId: userId },
                attributes: ['clinicId']
            });

            if (!clinicManagerRecord) {
                return resolve({
                    errCode: 2,
                    errMessage: 'This user is not assigned to any clinic',
                    data: {}
                });
            }

            const clinicId = clinicManagerRecord.clinicId;

            // Lấy thông tin phòng khám
            const doctorData = await db.Doctor_Infor.findAll({
                where: { clinicId },
            });

            if (!doctorData) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Doctor not found',
                    data: {}
                });
            }

            const doctorIds = doctorData.map(doctor => doctor.doctorId);
            const doctorDetails = await db.User.findAll({
                where: { id: doctorIds },
                exclude: ['password', 'image'],
            });           

            return resolve({
                errCode: 0,
                errMessage: 'ok',
                data: doctorDetails
            });
        } catch (e) {
            reject(e)
        }
    })
}

let getUserBookingsByManager = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing userId',
                    data: {}
                });
            }

            // Tìm clinicId mà manager này phụ trách
            const clinicManagerRecord = await db.Clinic_Manager.findOne({
                where: { userId: userId },
                attributes: ['clinicId']
            });

            if (!clinicManagerRecord) {
                return resolve({
                    errCode: 2,
                    errMessage: 'This user is not assigned to any clinic',
                    data: {}
                });
            }

            // Lấy doctorId từ clinicId
            const doctorId = await db.Doctor_Infor.findOne({
                where: { clinicId: clinicManagerRecord.clinicId },
                attributes: ['doctorId']
            });

            if (!doctorId) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Doctor not found',
                    data: {}
                });
            }

            // Lấy danh sách các lịch hẹn (booking)
            let bookings = await db.Booking.findAll({
                where: { doctorId: doctorId.doctorId },
                attributes: ['id', 'doctorId', 'patientId', 'date', 'timeType', 'statusId', 'reason'],
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['email', 'firstName', 'lastName', 'address', 'gender', 'image'],
                        include: [
                            {
                                model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']
                            }
                        ],
                    },
                    {
                        model: db.User,
                        as: 'patientData',
                        attributes: ['email', 'firstName', 'lastName', 'address', 'gender', 'image'],
                        include: [
                            {
                                model: db.Allcode,
                                as: 'genderData',
                                attributes: ['valueEn', 'valueVi']
                            }
                        ]
                    },
                    {
                        model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
                    },
                    {
                        model: db.Allcode, as: 'statusIdDataPatient', attributes: ['valueEn', 'valueVi']
                    },
                ],
                raw: false,
                nest: true
            });

            // Kiểm tra và xử lý BLOB hình ảnh
            bookings = bookings.map(item => {
                // Kiểm tra nếu doctorData không phải null và có image
                if (item.doctorData && item.doctorData.image) {
                    item.doctorData.image = new Buffer(item.doctorData.image, 'base64').toString('binary');
                }

                // Kiểm tra nếu patientData không phải null và có image
                if (item.patientData && item.patientData.image) {
                    item.patientData.image = new Buffer(item.patientData.image, 'base64').toString('binary');
                }

                return item;
            });

            resolve({
                errCode: 0,
                errMessage: 'OK',
                data: bookings
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getPackageBookingsByManager = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing userId',
                    data: []
                });
            }

            // Tìm clinicId mà người quản lý phụ trách
            const clinicManager = await db.Clinic_Manager.findOne({
                where: { userId },
                attributes: ['clinicId']
            });

            if (!clinicManager) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic manager not found',
                    data: []
                });
            }

            // Lấy các package thuộc clinic này
            const packages = await db.ExamPackage.findAll({
                where: { clinicId: clinicManager.clinicId },
                attributes: ['id']
            });

            const packageIds = packages.map(p => p.id);

            if (packageIds.length === 0) {
                return resolve({
                    errCode: 3,
                    errMessage: 'No exam packages found for this clinic',
                    data: []
                });
            }

            // Lấy danh sách lịch đặt gói khám
            const bookings = await db.BookingPackage.findAll({
                where: {
                    packageId: packageIds
                },
                attributes: ['id', 'packageId', 'patientId', 'date', 'timeType', 'statusId', 'reason'],
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: db.ExamPackage,
                        as: 'packageData',
                        attributes: ['name', 'price', 'image'],
                        include: [
                            {
                                model: db.Clinic,
                                as: 'clinicInfo',
                                attributes: ['name', 'address']
                            },
                            {
                                model: db.Allcode,
                                as: 'provinceTypeData',
                                attributes: ['valueVi', 'valueEn']
                            }
                        ]
                    },
                    {
                        model: db.User,
                        as: 'patientData',
                        attributes: ['email', 'firstName', 'lastName', 'gender', 'address', 'image'],
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
                        model: db.Allcode,
                        as: 'statusData',
                        attributes: ['valueVi', 'valueEn']
                    }
                ],
                raw: false,
                nest: true
            });

            // Chuyển đổi ảnh base64 sang binary nếu có
            const bookingsWithImage = bookings.map(item => {
                if (item.packageData && item.packageData.image) {
                    item.packageData.image = new Buffer(item.packageData.image, 'base64').toString('binary');
                }
                if (item.patientData && item.patientData.image) {
                    item.patientData.image = new Buffer(item.patientData.image, 'base64').toString('binary');
                }
                return item;
            });

            return resolve({
                errCode: 0,
                errMessage: 'OK',
                data: bookingsWithImage
            });

        } catch (e) {
            reject(e);
        }
    });
};


let getAllClinicManager = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinicManager = await db.User.findAll({
                where: { roleId: 'R4' },
                attributes: {
                    exclude: ['password', 'image']
                },
                include: [
                    {
                        model: db.Clinic_Manager,
                        as: 'managedClinics',
                        attributes: ['clinicId'], // Lấy clinicId từ bảng Clinic_Manager
                        include: [
                            {
                                model: db.Clinic,
                                as: 'clinic',
                                attributes: ['name', 'address'] // Lấy tên và địa chỉ phòng khám nếu cần
                            }
                        ]
                    }
                ]
            })
            resolve({
                errCode: 0,
                data: clinicManager
            });
        } catch (e) {
            reject(e)
        }
    })
}

let assignClinicToManager = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.userId || !data.clinicId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            // Kiểm tra xem quản lý này đã được gán phòng khám chưa
            let existingManager = await db.Clinic_Manager.findOne({
                where: { userId: data.userId }
            });

            if (existingManager) {
                // Nếu đã có người quản lý, thay đổi phòng khám hiện tại
                existingManager.clinicId = data.clinicId;  // Cập nhật phòng khám mới
                await existingManager.save();  // Lưu thay đổi
                resolve({
                    errCode: 0,
                    errMessage: 'Clinic updated for the manager successfully'
                });
                return;
            }

            // Nếu chưa có người quản lý, tạo mới bản ghi
            await db.Clinic_Manager.create({
                userId: data.userId,
                clinicId: data.clinicId
            });

            resolve({
                errCode: 0,
                errMessage: 'Assign clinic to manager successfully'
            });
        } catch (error) {
            reject(error);
        }
    });
};





module.exports = {
    getDetailClinicByManagerUserId: getDetailClinicByManagerUserId,
    getClinicByManager: getClinicByManager,
    getAllDoctorsByMagager: getAllDoctorsByMagager,
    getUserBookingsByManager: getUserBookingsByManager,
    getAllClinicManager: getAllClinicManager,
    assignClinicToManager: assignClinicToManager,
    getPackageBookingsByManager: getPackageBookingsByManager
};
