import db from "../models/index"
import bcrypt from 'bcryptjs'
import emailService from './emailService'
import { console } from "inspector";
const { Op, Sequelize } = require('sequelize');


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
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số yêu cầu
            if (!data.id || !data.roleId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                });
                return;
            }

            // Tìm người dùng theo ID
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false  // Để có thể chỉnh sửa các thuộc tính
            });

            // Kiểm tra nếu người dùng tồn tại
            if (user) {
                user.firstName = data.firstName || user.firstName;
                user.lastName = data.lastName || user.lastName;
                user.address = data.address || user.address;
                user.roleId = data.roleId || user.roleId;
                user.positionId = data.positionId || user.positionId;
                user.gender = data.gender || user.gender;
                user.phonenumber = data.phonenumber || user.phonenumber;
                user.insuranceCode = data.insuranceCode || user.insuranceCode;
                user.idCardNumber = data.idCardNumber || user.idCardNumber;
                user.occupation = data.occupation || user.occupation;
                user.birthDate = data.birthDate || user.birthDate;

                // Cập nhật ảnh người dùng nếu có
                if (data.avatar) {
                    user.image = data.avatar || user.image;
                }

                // Lưu lại các thay đổi vào cơ sở dữ liệu
                await user.save();

                resolve({
                    errCode: 0,
                    errMessage: 'Update the user succeeded!'
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: `User not found!`
                });
            }

        } catch (e) {
            reject(e);
        }
    });
};


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
                order: [['date', 'ASC']],
                include: [
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['email', 'firstName', 'address', 'gender', 'phonenumber', 'image', 'lastName'],
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
                    {
                        model: db.Doctor_Infor,
                        as: 'doctorBooking',
                        include: [
                            {
                                model: db.Specialty,
                                as: 'specialtyData',
                                attributes: ['id', 'name', 'descriptionMarkdown', 'descriptionHTML', 'image']
                            },
                            {
                                model: db.Clinic,
                                as: 'clinicData',
                                attributes: ['id', 'name', 'address', 'descriptionMarkdown', 'descriptionHTML', 'image']
                            }
                        ],
                        attributes: ['doctorId', 'specialtyId', 'clinicId', 'priceId', 'provinceId', 'paymentId', 'addressClinic', 'nameClinic', 'note']
                    }
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
                    if (booking && booking.remedyImage) {
                        booking.remedyImage = Buffer.from(booking.remedyImage, 'base64').toString('binary');
                    }
                    if (booking && booking.qrCode) {
                        booking.qrCode = Buffer.from(booking.qrCode, 'base64').toString('binary');
                    }
                    // Nếu muốn chuyển ảnh chuyên khoa hoặc phòng khám (nếu có), cũng có thể xử lý tương tự
                    return booking;
                });
            }
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
        try {
            // 1. Tìm booking
            let foundAppointment = await db.Booking.findOne({
                where: { id: appointmentId }
            });
            if (!foundAppointment) {
                return resolve({
                    errCode: 2,
                    errMessage: `The Appointment isn't exist`
                });
            }

            // 2. Tìm schedule liên quan
            let schedule = await db.Schedule.findOne({
                where: {
                    doctorId: foundAppointment.doctorId,
                    date: foundAppointment.date,
                    timeType: foundAppointment.timeType
                }
            });

            // 3. Giảm số lượng hiện tại nếu tìm thấy
            if (schedule && schedule.currentNumber > 0) {
                schedule.currentNumber -= 1;
                await schedule.save();
            }

            // 4. Xóa booking
            await db.Booking.destroy({
                where: { id: appointmentId }
            });

            // 5. Trả về kết quả
            resolve({
                errCode: 0,
                message: `The appointment is deleted`
            });
        } catch (e) {
            reject(e);
        }
    });
};


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

const submitFeedback = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.appointmentId || !data.feedback) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
                return;
            }
            // Tìm cuộc hẹn theo ID
            let appointment = await db.Booking.findOne({
                where: { id: data.appointmentId }
            });
            // Kiểm tra nếu cuộc hẹn tồn tại
            if (!appointment) {
                resolve({
                    errCode: 2,
                    errMessage: 'Appointment not found'
                });
                return;
            }
            // Cập nhật phản hồi
            appointment.feedback = data.feedback;
            await appointment.save();
            resolve({
                errCode: 0,
                errMessage: 'Feedback submitted successfully'
            });

        } catch (e) {
            console.error('Error in submitFeedback service:', e);
            reject(e);
        }
    }
    );
};

const submitFeedbackPackage = async (data) => {
    return new Promise (async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.appointmentId || !data.feedback) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
                return;
            }

            // Tìm cuộc hẹn theo ID
            let appointment = await db.BookingPackage.findOne({
                where: { id: data.appointmentId }
            });

            // Kiểm tra nếu cuộc hẹn tồn tại
            if (!appointment) {
                resolve({
                    errCode: 2,
                    errMessage: 'Appointment not found'
                });
                return;
            }

            // Cập nhật phản hồi
            appointment.feedback = data.feedback;
            await appointment.save();

            resolve({
                errCode: 0,
                errMessage: 'Feedback submitted successfully'
            });

        } catch (e) {
            console.error('Error in submitFeedback service:', e);
            reject(e);
        }
    });
}

// 1️⃣ Lấy tất cả các lịch hẹn gói khám của bệnh nhân
let getUserPackageBookings = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let bookings = await db.BookingPackage.findAll({
        where: { patientId: userId },
        include: [
          {
            model: db.ExamPackage,
            as: 'packageData',
            attributes: ['id', 'name', 'price', 'description', 'image', 'note', 'isDepositRequired', 'depositPercent'],
            include: [
              {
                model: db.Clinic,
                as: 'clinicInfo',
                attributes: ['name', 'address']
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
      // Chuyển đổi image sang binary cho từng booking
      if (bookings && bookings.length > 0) {
        bookings = bookings.map(booking => {
          if (booking.packageData && booking.packageData.image) {
            booking.packageData.image = Buffer.from(booking.packageData.image, 'base64').toString('binary');
          }
          //remedyImage
         if (booking && booking.remedyImage) {
             booking.remedyImage = Buffer.from(booking.remedyImage, 'base64').toString('binary');
         }

         if (booking && booking.qrCode) {
             booking.qrCode = Buffer.from(booking.qrCode, 'base64').toString('binary');
         }
          return booking;
        });
      }

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

// 2️⃣ Xóa một cuộc hẹn gói khám
let deletePackageAppointment = (appointmentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let found = await db.BookingPackage.findOne({
        where: { id: appointmentId }
      });
      if (!found) {
        return resolve({
          errCode: 2,
          errMessage: `AppointmentPackage không tồn tại`
        });
      }

        // Tìm lịch liên quan  
      let schedule = await db.SchedulePackage.findOne({
        where: {
          packageId: found.packageId,
          date: found.date,
          timeType: found.timeType
        }
      });

        // Giảm số lượng hiện tại nếu tìm thấy
      if (schedule && schedule.currentNumber > 0) {
          schedule.currentNumber -= 1;
          await schedule.save();
      }
        // Xóa cuộc hẹn
      await db.BookingPackage.destroy({
        where: { id: appointmentId }
      });
      resolve({
        errCode: 0,
        errMessage: 'Xóa cuộc hẹn gói khám thành công'
      });
    } catch (e) {
      reject(e);
    }
  });
};

// 3️⃣ Lấy thông tin “đặt cọc” (deposit) cho cuộc hẹn gói khám
let getDepositInfoPackage = async (appointmentId) => {
  try {
    let bookings = await db.BookingPackage.findAll({
      where: { id: appointmentId },
      include: [
        {
          model: db.ExamPackage,
          as: 'packageData',
          attributes: ['id', 'name', 'price', 'note','isDepositRequired', 'depositPercent','image'],
          include: [
            {
              model: db.Allcode,
              as: 'paymentTypeData',    
              attributes: ['valueEn', 'valueVi']
            },
            {
              model: db.Clinic,
              as: 'clinicInfo',
              attributes: ['name', 'address']
            }
          ]
        },
        {
          model: db.User,
          as: 'patientData',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      raw: false,
      nest: true
    });

    // Chuyển đổi image sang binary cho từng booking
    if (bookings && bookings.length > 0) {
      bookings = bookings.map(booking => {
        if (booking.packageData && booking.packageData.image) {
          booking.packageData.image = Buffer.from(booking.packageData.image, 'base64').toString('binary');
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
    console.error('Error in getDepositInfoPackage service:', error);
    throw error;
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


let getDepositReport = (from, to) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!from || !to) {
        return resolve({
          errCode: 1,
          errMessage: "Missing 'from' or 'to' parameters"
        });
      }

      const fromDate = new Date(from).getTime();
      const toDate = new Date(to).getTime();

      if (isNaN(fromDate) || isNaN(toDate)) {
        return resolve({
          errCode: 2,
          errMessage: "Invalid date format for 'from' or 'to'"
        });
      }

      // 1. Tổng tiền chỉ của giao dịch PENDING theo clinicId
      const pendingTotals = await db.DepositTransaction.findAll({
        attributes: [
          'clinicId',
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
        ],
        where: {
          paymentTime: { [Op.between]: [fromDate, toDate] },
          status: 'PENDING'
        },
        group: ['clinicId']
      });

      const pendingMap = {};
      for (let item of pendingTotals) {
        pendingMap[item.clinicId] = Number(item.dataValues.totalAmount);
      }

      // 2. Lấy toàn bộ giao dịch (PENDING và SETTLED)
      const allTransactions = await db.DepositTransaction.findAll({
        where: {
          paymentTime: { [Op.between]: [fromDate, toDate] }
        },
        include: [
          {
            model: db.Clinic,
            as: 'clinicInfo',
            attributes: ['id', 'name', 'address']
          }
        ],
        order: [['paymentTime', 'DESC']]
      });

      // 3. Gom giao dịch theo clinicId
      const transactionsByClinic = {};
      for (let tx of allTransactions) {
        const clinicId = tx.clinicId;
        if (!transactionsByClinic[clinicId]) {
          transactionsByClinic[clinicId] = {
            clinicId,
            clinicInfo: tx.clinicInfo,
            detailedTransactions: [],
            totalAmount: pendingMap[clinicId] || 0
          };
        }
        transactionsByClinic[clinicId].detailedTransactions.push(tx);
      }

      // 4. Chuyển object thành array
      const combinedData = Object.values(transactionsByClinic);

      resolve({
        errCode: 0,
        errMessage: 'OK',
        reportPeriod: { from, to },
        clinicReports: combinedData
      });

    } catch (error) {
      reject(error);
    }
  });
};


let getDepositReportByClinic = (clinicId, from, to) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!clinicId || !from || !to) {
        return resolve({
          errCode: 1,
          errMessage: "Missing 'clinicId', 'from' or 'to' parameters"
        });
      }

      const fromDate = new Date(from).getTime();
      const toDate = new Date(to).getTime();

      if (isNaN(fromDate) || isNaN(toDate)) {
        return resolve({
          errCode: 2,
          errMessage: "Invalid date format for 'from' or 'to'"
        });
      }

      // Tổng số tiền của phòng khám
      const total = await db.DepositTransaction.findOne({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
        ],
        where: {
          clinicId,
          paymentTime: { [Op.between]: [fromDate, toDate] },
          status: 'PENDING'
        }
      });

      const detailedTransactions = await db.DepositTransaction.findAll({
        where: {
          clinicId,
          paymentTime: { [Op.between]: [fromDate, toDate] }
        },
        include: [
          {
            model: db.Clinic,
            as: 'clinicInfo',
            attributes: ['name', 'address']
          }
        ],
        order: [['paymentTime', 'DESC']]
      });

      resolve({
        errCode: 0,
        errMessage: 'OK',
        reportPeriod: { from, to },
        clinicId,
        clinicInfo: detailedTransactions[0]?.clinicInfo || {},
        totalAmount: total?.dataValues?.totalAmount || 0,
        detailedTransactions
      });

    } catch (error) {
      reject(error);
    }
  });
};

const toggleTransactionStatus = (transactionId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let transaction = await db.DepositTransaction.findByPk(transactionId);
            if (!transaction) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Transaction not found'
                });
            }

            if (transaction.status === 'PENDING') {
                transaction.status = 'SETTLED';
            } else if (transaction.status === 'SETTLED') {
                transaction.status = 'PENDING';
            } else {
                return resolve({
                    errCode: 2,
                    errMessage: `Only transactions with status PENDING or SETTLED can be toggled. Current status: ${transaction.status}`
                });
            }

            await transaction.save();
            resolve({
                errCode: 0,
                errMessage: 'Transaction status updated successfully',
                data: transaction
            });
        } catch (e) {
            reject(e);
        }
    });
}

const toggleStatusForClinic = async (clinicId, from, to) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fromDate = new Date(from);
            const toDate = new Date(to);

            let transactions = await db.DepositTransaction.findAll({
                where: {
                    clinicId: clinicId,
                    paymentTime: {
                        [Op.between]: [fromDate, toDate],
                    },
                },
            });

            if (!transactions || transactions.length === 0) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Không có giao dịch nào trong khoảng thời gian này',
                });
            }

            for (let transaction of transactions) {
                transaction.status = (transaction.status === 'PENDING') ? 'SETTLED' : 'PENDING';
                await transaction.save();
            }

            return resolve({
                errCode: 0,
                errMessage: 'Cập nhật trạng thái thành công',
                updatedCount: transactions.length
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
    handleChangePassword: handleChangePassword,
    getUserPackageBookings: getUserPackageBookings,
    deletePackageAppointment: deletePackageAppointment,
    getDepositInfoPackage: getDepositInfoPackage,
    submitFeedback: submitFeedback,
    submitFeedbackPackage: submitFeedbackPackage,
    getDepositReport: getDepositReport,
    getDepositReportByClinic: getDepositReportByClinic,
    toggleTransactionStatus: toggleTransactionStatus,
    toggleStatusForClinic: toggleStatusForClinic

}