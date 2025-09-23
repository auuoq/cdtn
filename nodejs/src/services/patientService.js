import db from "../models/index"
require('dotenv').config();
import emailService from './emailService'
import { v4 as uuidv4 } from 'uuid';
const QRCode = require('qrcode');


let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra thiếu trường
            if (!data.email || !data.doctorId || !data.timeType
                || !data.date || !data.fullName || !data.selectedGender
                || !data.address || !data.reason) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            }

            // Tạo token và gửi email xác nhận
            const token = uuidv4();
            await emailService.sendSimpleEmail({
                type: 'doctor',
                receiverEmail: data.email,
                patientName: data.fullName,
                time: data.timeString,
                doctorName: data.doctorName,
                language: data.language,
                redirectLink: buildUrlEmail(data.doctorId, token)
            });

            // Tìm hoặc tạo user
            const [user] = await db.User.findOrCreate({
                where: { email: data.email },
                defaults: {
                    email: data.email,
                    roleId: 'R3',
                    gender: data.selectedGender,
                    address: data.address,
                    firstName: data.fullName
                }
            });

            // Tạo booking
            const [booking, created] = await db.Booking.findOrCreate({
                where: {
                    patientId: user.id,
                    doctorId: data.doctorId,
                    token: token
                },
                defaults: {
                    statusId: 'S1',
                    doctorId: data.doctorId,
                    patientId: user.id,
                    date: data.date,
                    timeType: data.timeType,
                    token: token,
                    reason: data.reason
                }
            });

            // Nếu booking vừa được tạo, thêm QR và tăng currentNumber
            if (created) {
                const type = 'doctor';
                const qrContent = `http://192.168.4.171:3002/qrcode-booking?type=${type}&token=${token}`;
                const qrImage = await QRCode.toDataURL(qrContent);
                booking.qrCode = qrImage;
                await booking.save();

                const schedule = await db.Schedule.findOne({
                    where: {
                        doctorId: data.doctorId,
                        date: data.date,
                        timeType: data.timeType
                    }
                });

                if (schedule) {
                    schedule.currentNumber += 1;
                    await schedule.save();
                }
                const doctorInfor = await db.DoctorInfor.findOne({
                     where: { doctorId: data.doctorId }
                });
                if (doctorInfor) {
                    doctorInfor.count = (doctorInfor.count || 0) + 1;
                    await doctorInfor.save();
                }
            }

            // Gửi tin nhắn nội bộ xác nhận đặt lịch
            const doctorInfo = await db.DoctorInfor.findOne({
                where: { doctorId: data.doctorId },
                attributes: ['nameClinic', 'addressClinic']
            });

            let clinicInfo = '';
            if (doctorInfo) {
                clinicInfo = ` tại ${doctorInfo.nameClinic}, địa chỉ: ${doctorInfo.addressClinic}`;
            }

            const systemUser = await db.User.findOne({ where: { email: 'system@yourapp.com' } });
            const systemId = systemUser ? systemUser.id : 1;

            await db.Message.create({
                senderId: systemId,
                receiverId: user.id,
                message: `Bạn đã đặt lịch khám với bác sĩ ${data.doctorName} vào lúc ${data.timeString}${clinicInfo}. Vui lòng kiểm tra email để xác nhận lịch hẹn.`,
                status: 'sent'
            });

            return resolve({
                errCode: 0,
                errMessage: 'Save info patient succeed!'
            });

        } catch (e) {
            reject(e);
        }
    });
};

// patientService.js

let updateBookingSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { bookingId, newDate, newTimeType } = data;

            if (!bookingId || !newDate || !newTimeType) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            }

            let booking = await db.Booking.findOne({
                where: { id: bookingId },
            });

            if (!booking) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Booking not found'
                });
            }

            const doctorId = booking.doctorId;
            const oldDate = booking.date;
            const oldTimeType = booking.timeType;

            const newSchedule = await db.Schedule.findOne({
                where: {
                    doctorId,
                    date: newDate,
                    timeType: newTimeType
                }
            });

            if (!newSchedule) {
                return resolve({
                    errCode: 3,
                    errMessage: 'New schedule not available'
                });
            }

            if (newSchedule.currentNumber >= newSchedule.maxNumber) {
                return resolve({
                    errCode: 4,
                    errMessage: 'New schedule is full'
                });
            }

            // Giảm số lượng ở lịch cũ
            const oldSchedule = await db.Schedule.findOne({
                where: {
                    doctorId,
                    date: oldDate,
                    timeType: oldTimeType
                }
            });

            if (oldSchedule && oldSchedule.currentNumber > 0) {
                oldSchedule.currentNumber -= 1;
                await oldSchedule.save();
            }

            // Tăng số lượng ở lịch mới
            newSchedule.currentNumber += 1;
            await newSchedule.save();

            // Cập nhật booking
            booking.date = newDate;
            booking.timeType = newTimeType;
            await booking.save();

            resolve({
                errCode: 0,
                errMessage: 'Reschedule success'
            });
        } catch (error) {
            reject(error);
        }
    });
};


let updateBookingPackageSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { bookingId, newDate, newTimeType } = data;

      if (!bookingId || !newDate || !newTimeType) {
        return resolve({
          errCode: 1,
          errMessage: 'Missing parameter'
        });
      }

      let booking = await db.BookingPackage.findOne({
        where: { id: bookingId }
      });

      if (!booking) {
        return resolve({
          errCode: 2,
          errMessage: 'Booking not found'
        });
      }

      const packageId = booking.packageId;
      const oldDate = booking.date;
      const oldTimeType = booking.timeType;

      const newSchedule = await db.SchedulePackage.findOne({
        where: {
          packageId,
          date: newDate,
          timeType: newTimeType
        }
      });

      if (!newSchedule) {
        return resolve({
          errCode: 3,
          errMessage: 'New schedule not available'
        });
      }

      if (newSchedule.currentNumber >= newSchedule.maxNumber) {
        return resolve({
          errCode: 4,
          errMessage: 'New schedule is full'
        });
      }

      const oldSchedule = await db.SchedulePackage.findOne({
        where: {
          packageId,
          date: oldDate,
          timeType: oldTimeType
        }
      });

      if (oldSchedule && oldSchedule.currentNumber > 0) {
        oldSchedule.currentNumber -= 1;
        await oldSchedule.save();
      }

      newSchedule.currentNumber += 1;
      await newSchedule.save();

      // Cập nhật booking
      booking.date = newDate;
      booking.timeType = newTimeType;
      await booking.save();

      resolve({
        errCode: 0,
        errMessage: 'Reschedule success'
      });
    } catch (error) {
      reject(error);
    }
  });
};



let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false //raw need set to be 'false' so that we can make update/change data to db
                });           // raw: true -> return object of js / raw: false -> return object of sequelize

                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save();

                    resolve({
                        errCode: 0,
                        errMessage: "Update the appointment succeed!"
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been activated or does not exist"
                    });
                }
            }

        } catch (e) {
            reject(e);
        }
    })
}

let buildUrlEmailPackage = (packageId, token) => {
    return `${process.env.URL_REACT}/verify-booking-package?token=${token}&packageId=${packageId}`;
};

let postBookExamPackageAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.email || !data.packageId || !data.timeType || !data.date ||
                !data.fullName || !data.selectedGender || !data.address || !data.reason
            ) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            }

            const packageData = await db.ExamPackage.findOne({
                where: { id: data.packageId },
                attributes: ['isDepositRequired', 'depositPercent', 'price', 'name']
            });

            if (!packageData) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Exam package not found'
                });
            }

            const token = uuidv4();

            let [user] = await db.User.findOrCreate({
                where: { email: data.email },
                defaults: {
                    email: data.email,
                    roleId: 'R3',
                    gender: data.selectedGender,
                    address: data.address,
                    firstName: data.fullName
                }
            });

            const depositAmount = packageData.isDepositRequired
                ? Math.round(packageData.price * (packageData.depositPercent || 0) / 100)
                : 0;

            let [booking, created] = await db.BookingPackage.findOrCreate({
                where: {
                    patientId: user.id,
                    packageId: data.packageId,
                    token: token
                },
                defaults: {
                    statusId: 'S1',
                    packageId: data.packageId,
                    patientId: user.id,
                    date: data.date,
                    timeType: data.timeType,
                    token: token,
                    reason: data.reason,
                    depositStatus: packageData.isDepositRequired ? 'UNPAID' : 'NOT_REQUIRED',
                    depositAmount: depositAmount
                }
            });

            if (created) {
                const schedule = await db.SchedulePackage.findOne({
                    where: {
                        packageId: data.packageId,
                        date: data.date,
                        timeType: data.timeType
                    }
                });

                if (schedule) {
                    schedule.currentNumber += 1;
                    await schedule.save();
                }

                const type = 'package';
                const qrContent = `http://192.168.4.171:3002/qrcode-booking?type=${type}&token=${token}`;
                const qrImage = await QRCode.toDataURL(qrContent);
                booking.qrCode = qrImage;
                await booking.save();
            }

            // Gửi email nếu không yêu cầu đặt cọc
            if (!packageData.isDepositRequired) {
                await emailService.sendSimpleEmail({
                    type: 'package',
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    packageName: packageData.name,
                    language: data.language,
                    redirectLink: buildUrlEmailPackage(data.packageId, token)
                });
            }

            // Gửi tin nhắn thông báo cho bệnh nhân
            const appointmentInfo = `🩺 Gói khám: ${packageData.name}\n📅 Thời gian: ${data.timeString}`;

            const messageText = packageData.isDepositRequired
                ? `${appointmentInfo}\n\n💵 Đặt cọc: ${depositAmount.toLocaleString('vi-VN')}đ\n✅ Vui lòng thanh toán đặt cọc để xác nhận lịch hẹn!`
                : `${appointmentInfo}\n✅ Vui lòng kiểm tra email để xác nhận lịch hẹn!`;

            await db.Message.create({
                senderId: 1,
                receiverId: user.id,
                message: messageText,
                status: 'sent'
            });

            return resolve({
                errCode: 0,
                errMessage: packageData.isDepositRequired
                    ? 'Booking created. Please proceed with deposit payment.'
                    : 'Save exam package booking succeed!',
                qrCode: booking.qrCode // optional: trả về nếu frontend cần hiển thị
            });
        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
};

let postVerifyBookExamPackageAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.packageId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            let appointment = await db.BookingPackage.findOne({
                where: {
                    packageId: data.packageId,
                    token: data.token,
                    statusId: 'S1'
                },
                raw: false
            });

            if (appointment) {
                appointment.statusId = 'S2'; // Đã xác nhận
                await appointment.save();

                resolve({
                    errCode: 0,
                    errMessage: 'Update appointment succeed!'
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Appointment has been verified or does not exist'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let postVerifyDeposit = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.packageId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
                return;
            }

            let appointment = await db.BookingPackage.findOne({
                where: {
                    packageId: data.packageId,
                    token: data.token,
                    statusId: 'S1'
                },
                raw: false,
                include: [
                    {
                        model: db.ExamPackage,
                        as: 'packageData'
                    }
                ]
            });

            if (appointment) {
                const examPackage = appointment.packageData;

                let depositAmount = 0;
                if (examPackage && examPackage.depositPercent) {
                    depositAmount = Math.round(
                        (parseFloat(examPackage.price) * examPackage.depositPercent) / 100
                    );
                }

                await db.DepositTransaction.create({
                    bookingId: appointment.id,
                    clinicId: examPackage.clinicId,
                    packageId: examPackage.id,
                    amount: depositAmount,
                    status: 'PENDING',
                    paymentTime: new Date(), // Hoặc lấy từ data.responseTime nếu bạn muốn
                    payType: data.payType,
                    momoTransId: data.transId,
                    partnerCode: data.partnerCode,
                    orderId: data.orderId,
                    requestId: data.requestId,
                });

                appointment.statusId = 'S2';
                appointment.depositStatus = 'PAID';
                appointment.depositAmount = depositAmount;

                await appointment.save();

                resolve({
                    errCode: 0,
                    errMessage: 'Update appointment and deposit info succeed!'
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: 'Appointment has been verified or does not exist'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

const checkBookingByQRCode = (type, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!type || !token) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing QR code type or token',
                });
            }

            let booking = null;

            if (type === 'doctor') {
                booking = await db.Booking.findOne({
                    where: { token },
                    attributes: ['id', 'date', 'timeType', 'statusId', 'reason'],
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'lastName', 'address'],
                            include: [
                                {
                                    model: db.Allcodes,
                                    as: 'genderData',
                                    attributes: ['valueEn', 'valueVi'],
                                },
                            ],
                        },
                        {
                            model: db.User,
                            as: 'doctorData',
                            attributes: ['email', 'firstName', 'address', 'gender', 'phonenumber', 'image', 'lastName'],
                            include: [
                                {
                                    model: db.Allcodes,
                                    as: 'genderData',
                                    attributes: ['valueEn', 'valueVi'],
                                },
                            ],
                        },
                        {
                            model: db.Allcodes,
                            as: 'timeTypeDataPatient',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.Allcodes,
                            as: 'statusIdDataPatient',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.DoctorInfor,
                            as: 'doctorBooking',
                            include: [
                                {
                                    model: db.Specialty,
                                    as: 'specialtyData',
                                    attributes: ['id', 'name', 'descriptionMarkdown', 'descriptionHTML', 'image'],
                                },
                                {
                                    model: db.Clinic,
                                    as: 'clinicData',
                                    attributes: ['id', 'name', 'address', 'descriptionMarkdown', 'descriptionHTML', 'image'],
                                },
                            ],
                            attributes: ['doctorId', 'specialtyId', 'clinicId', 'priceId', 'provinceId', 'paymentId', 'addressClinic', 'nameClinic', 'note'],
                        },
                    ],
                });

                // Xử lý ảnh bác sĩ
                if (booking?.doctorData?.image) {
                    booking.doctorData.image = Buffer.from(booking.doctorData.image, 'base64').toString('binary');
                }

            } else if (type === 'package') {
                booking = await db.BookingPackage.findOne({
                    where: { token },
                    attributes: ['id', 'date', 'timeType', 'statusId', 'reason', 'depositStatus', 'depositAmount'],
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'lastName', 'address'],
                            include: [
                                {
                                    model: db.Allcodes,
                                    as: 'genderData',
                                    attributes: ['valueEn', 'valueVi'],
                                },
                            ],
                        },
                        {
                            model: db.ExamPackage,
                            as: 'packageData',
                            attributes: ['id', 'name', 'price', 'description', 'image', 'note', 'isDepositRequired', 'depositPercent'],
                            include: [
                                {
                                    model: db.Clinic,
                                    as: 'clinicInfo',
                                    attributes: ['name', 'address'],
                                },
                            ],
                        },
                        {
                            model: db.Allcodes,
                            as: 'timeTypeDataPatient',
                            attributes: ['valueEn', 'valueVi'],
                        },
                        {
                            model: db.Allcodes,
                            as: 'statusIdDataPatient',
                            attributes: ['valueEn', 'valueVi'],
                        },
                    ],
                });

                // Xử lý ảnh gói khám và QR code
                if (booking?.packageData?.image) {
                    booking.packageData.image = Buffer.from(booking.packageData.image, 'base64').toString('binary');
                }
                if (booking?.qrCode) {
                    booking.qrCode = Buffer.from(booking.qrCode, 'base64').toString('binary');
                }
            } else {
                return resolve({
                    errCode: 3,
                    errMessage: 'Unknown booking type',
                });
            }

            if (booking) {
                return resolve({
                    errCode: 0,
                    errMessage: 'Booking found',
                    bookingData: booking,
                });
            } else {
                return resolve({
                    errCode: 4,
                    errMessage: 'Booking not found',
                });
            }
        } catch (error) {
            return reject(error);
        }
    });
};




module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    postBookExamPackageAppointment: postBookExamPackageAppointment,
    postVerifyBookExamPackageAppointment: postVerifyBookExamPackageAppointment,
    postVerifyDeposit: postVerifyDeposit,
    updateBookingSchedule: updateBookingSchedule,
    checkBookingByQRCode: checkBookingByQRCode,
    updateBookingPackageSchedule: updateBookingPackageSchedule
}