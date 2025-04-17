import db from "../models/index"
import bcrypt from 'bcryptjs'
import { Op } from 'sequelize'
import emailService from './emailService'

const crypto = require('crypto');
const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //user already exist
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    where: { email: email },
                    raw: true

                });
                if (user) {      //check user exist 1 more time here because sometime user delete their account during this function is working
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password); //this line can decrypt password in db and also do the comparison
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'OK';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found~`;
                }

            } else {
                //return error
                userData.errCode = 1;
                userData.errMessage = `Your email isn't exist, pls try other email`;
            }

            resolve(userData)
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }

            resolve(users);

        } catch (e) {
            reject(e);
        }
    })
}
// userService.js

const getUserInfoByEmail = async (email) => {
    try {
        let user = await db.User.findOne({
            where: { email: email },
            attributes: {
                exclude: ['password'] // Không trả về trường password
            }
        });

        if (!user) {
            return {
                errCode: 1,
                errMessage: "User not found!"
            };
        }

        // Lấy giá trị giới tính từ bảng allcode
        let genderCode = await db.Allcode.findOne({
            where: { keyMap: user.gender, type: 'GENDER' }
        });

        // Thêm thông tin giới tính vào đối tượng user
        if (genderCode) {
            user.gender = genderCode.valueVi; 
        }

        return {
            errCode: 0,
            data: user
        };
    } catch (error) {
        throw error;
    }
};



let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email is exist?
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in used, pls try another email!'
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                })

                resolve({
                    errCode: 0,
                    message: 'OK'
                });
            }



        } catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let foundUser = await db.User.findOne({
            where: { id: userId }
        })
        if (!foundUser) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }

        await db.User.destroy({
            where: { id: userId }
        })

        resolve({
            errCode: 0,
            message: `The user is deleted`
        })
    })
}

let updateUserData = (data) => {
    /**
     * editUser if you don't edit the raw: false,
     * you can do the same as destroy function in deleteUser with db.User.update({ field ...}, {where: {id : data.id}})
     */
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }

            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if (data.avatar) {
                    user.image = data.avatar;
                }


                await user.save();

                resolve({
                    errCode: 0,
                    message: 'Update the user succeeds!'
                })
            }
            else {
                resolve({
                    errCode: 1,
                    errMessage: `User's not found!`
                });
            }

        } catch (e) {
            reject(e);
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }



        } catch (e) {
            reject(e);
        }
    })
}

let getUserBookings = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let bookings = await db.Booking.findAll({
                where: { patientId: userId },
                include: [
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['email', 'firstName', 'address', 'gender'],
                        include: [
                            {
                                model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']
                            }
                        ],
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
            })
            

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

let deleteAppointment = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        let foundAppointment = await db.Booking.findOne({
            where: { id: appointmentId }
        })
        if (!foundAppointment) {
            resolve({
                errCode: 2,
                errMessage: `The Appointment isn't exist`
            })
        }

        await db.Booking.destroy({
            where: { id: appointmentId }
        })

        resolve({
            errCode: 0,
            message: `The appointment is deleted`
        })
    })
}

// userService.js

const getDepositInfo = async (appointmentId) => {
    try {
        let bookings = await db.Booking.findAll({
            where: { id: appointmentId },
            include: [
                {
                    model: db.Doctor_Infor,
                    as: 'doctorBooking',
                    attributes: ['priceId', 'paymentId', 'addressClinic', 'nameClinic'],
                    include: [
                        {
                            model: db.Allcode,
                            as: 'priceTypeData',
                            attributes: ['valueEn', 'valueVi']
                        }
                    ],
                },
                {
                    model: db.User,
                    as: 'doctorData',
                    attributes: ['lastName', 'firstName', 'image'], 
                },
            ],
            raw: false,
            nest: true
        });

        // Chuyển đổi image sang binary cho từng booking
        if (bookings && bookings.length > 0) {
            bookings = bookings.map(booking => {
                if (booking.doctorData && booking.doctorData.image) {
                    booking.doctorData.image = Buffer.from(booking.doctorData.image, 'base64').toString('binary');
                }
                return booking;
            });
        }

        return {
            errCode: 0,
            errMessage: 'OK',
            data: bookings
        };
    } catch (error) {
        console.error('Error in getDepositInfo service:', error);
        throw error; // Đảm bảo lỗi được ném ra để hàm API có thể xử lý
    }
};

let handleSendPasswordResetEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Thiếu email!'
                });
            }

            let user = await db.User.findOne({ where: { email: email } });
            if (!user) {
                return resolve({
                    errCode: -1,
                    errMessage: 'Email trên chưa được sử dụng'
                });
            }

            // Tạo token đặt lại mật khẩu
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            // Lưu token và thời hạn vào user
            user.resetPasswordToken = resetPasswordToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
            await user.save();

            // Gửi email đặt lại mật khẩu
            const resetUrl = `http://localhost:3002/reset-password/${resetToken}`;

            await emailService.sendPasswordResetEmail({
                receiverEmail: user.email,
                patientName: user.firstName + ' ' + user.lastName,
                redirectLink: resetUrl,
                language: 'vi' // hoặc 'en'
            });

            resolve({
                errCode: 0,
                errMessage: 'một liên kết đặt lại mật khẩu đã được gửi.'
            });
        } catch (e) {
            console.error('Error in handleSendPasswordResetEmail:', e);
            reject(e);
        }
    });
};

let handleResetPassword = (token, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!token || !newPassword) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Thiếu tham số cần thiết!'
                });
            }

            // Hash token để so sánh với token đã lưu trong database
            let resetPasswordToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Tìm người dùng với token và kiểm tra token còn hạn không
            let user = await db.User.findOne({
                where: {
                    resetPasswordToken: resetPasswordToken,
                    resetPasswordExpires: {
                        [Op.gt]: Date.now()
                    }
                }
            });

            if (!user) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Token không hợp lệ hoặc đã hết hạn.'
                });
            }

            // Hash mật khẩu mới
            let hashPasswordFromBcrypt = await bcrypt.hash(newPassword, 10);

            // Cập nhật mật khẩu và xóa token đặt lại
            user.password = hashPasswordFromBcrypt;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            resolve({
                errCode: 0,
                errMessage: 'Đặt lại mật khẩu thành công!'
            });
        } catch (e) {
            reject(e);
        }
    });
};

let handleChangePassword = (userId, currentPassword, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Find the user by ID
            let user = await db.User.findOne({
                where: { id: userId },
            });

            if (!user) {
                return resolve({
                    errCode: 1,
                    errMessage: "User not found!",
                });
            }

            // Check if the current password matches the hashed password in the database
            let isPasswordCorrect = await bcrypt.compareSync(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return resolve({
                    errCode: 2,
                    errMessage: "Current password is incorrect!",
                });
            }

            // Hash the new password
            let hashPasswordFromBcrypt = await bcrypt.hash(newPassword, 10);

            // Update the user's password
            user.password = hashPasswordFromBcrypt;
            await user.save();

            resolve({
                errCode: 0,
                errMessage: "Password updated successfully!",
            });
        } catch (e) {
            reject(e);
        }
    });
};



module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,
    getUserInfoByEmail: getUserInfoByEmail,
    getUserBookings: getUserBookings,
    deleteAppointment: deleteAppointment,
    getDepositInfo: getDepositInfo,
    handleResetPassword: handleResetPassword,
    handleSendPasswordResetEmail: handleSendPasswordResetEmail,
    handleChangePassword: handleChangePassword
}