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
                const qrContent = `BOOKING|${data.doctorId}|${user.id}|${data.date}|${data.timeType}|${token}`;
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
            }

            // Gửi tin nhắn nội bộ xác nhận đặt lịch
            const doctorInfo = await db.Doctor_Infor.findOne({
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

            // Check if the new schedule exists and has not reached maxNumber
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

            // Decrease old schedule's currentNumber (if found)
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

            // Update new schedule's currentNumber
            newSchedule.currentNumber += 1;
            await newSchedule.save();

            // Update booking
            booking.date = newDate;
            booking.timeType = newTimeType;
            const qrContent = `BOOKING|${doctorId}|${booking.patientId}|${newDate}|${newTimeType}|${booking.token}`;
            const newQrImage = await QRCode.toDataURL(qrContent);
            booking.qrCode = newQrImage;

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

                // ✅ Tạo mã QR chứa thông tin định danh (token, patientId, packageId)
                const qrData = JSON.stringify({
                    type: 'package',
                    token: token,
                    packageId: data.packageId,
                    patientId: user.id
                });

                const qrCodeBase64 = await QRCode.toDataURL(qrData); // QR dưới dạng base64

                // ✅ Lưu mã QR vào bảng BookingPackage
                booking.qrCode = qrCodeBase64;
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


module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    postBookExamPackageAppointment: postBookExamPackageAppointment,
    postVerifyBookExamPackageAppointment: postVerifyBookExamPackageAppointment,
    postVerifyDeposit: postVerifyDeposit,
    updateBookingSchedule: updateBookingSchedule
}