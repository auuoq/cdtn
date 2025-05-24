import db from "../models/index";

let toggleOnlineStatus = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing userId',
                });
            }
            
            const doctor = await db.User.findOne({
                where: { id: userId },
                attributes: ['id', 'firstName', 'lastName', 'image', 'roleId', 'isActive'],
            });
            if (!doctor || doctor.roleId !== 'R2') {
                return resolve({
                    errCode: 2,
                    errMessage: 'Doctor not found or not authorized',
                });
            }

            doctor.isActive = !doctor.isActive;
            await doctor.save();

            return resolve({
                errCode: 0,
                errMessage: 'ok',
                data: { isActive: doctor.isActive }
            });
        } catch (e) {
            console.error('Error in toggleOnlineStatus:', e);
            reject(e);
        }
    });
};

let getOnlineDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const onlineDoctors = await db.User.findAll({
                where: {
                    isActive: true,
                    roleId: 'R2'
                },
                attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        {
                            model: db.Allcode, as: 'positionData',
                            attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },

                    ],
            });

            if (!onlineDoctors || onlineDoctors.length === 0) {
                return resolve({
                    errCode: 1,
                    errMessage: 'No online doctors found',
                });
            }

            const formattedDoctors = onlineDoctors.map(doctor => {
                const doc = doctor.toJSON(); // convert Sequelize instance to plain object
                if (doc.image) {
                    doc.image = new Buffer(doc.image, 'base64').toString('binary');; 
                }
                return doc;
            });

            return resolve({
                errCode: 0,
                errMessage: 'ok',
                data: formattedDoctors
            });
        } catch (e) {
            console.error('Error in getOnlineDoctors:', e);
            reject(e);
        }
    });
};


let sendMessage = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { senderId, receiverId, message } = data;

            if (!senderId || !receiverId || !message) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            }
            const newMessage = await db.Message.create({
                senderId,
                receiverId,
                message,
                status: 'sent',
            });

            resolve({
                errCode: 0,
                errMessage: "Message sent",
                data: newMessage,
            });
        } catch (e) {
            reject(e);
        }
    });
};


let getMessagesBetweenUsers = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
        const { userId1, userId2 } = data;
        if (!userId1 || !userId2) {
            return resolve({
            errCode: 1,
            errMessage: "Missing required parameters",
            });
        }

        const messages = await db.Message.findAll({
            where: {
            [db.Sequelize.Op.or]: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 },
            ],
            },
            order: [['createdAt', 'ASC']],
        });

        resolve({
            errCode: 0,
            errMessage: "OK",
            data: messages,
        });
        } catch (e) {
        reject(e);
        }
    });
};

module.exports = {
    toggleOnlineStatus: toggleOnlineStatus,
    getOnlineDoctors: getOnlineDoctors,
    sendMessage: sendMessage,
    getMessagesBetweenUsers: getMessagesBetweenUsers,
};


