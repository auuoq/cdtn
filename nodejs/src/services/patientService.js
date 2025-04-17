import db from "../models/index"
require('dotenv').config();
import emailService from './emailService'
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType
                || !data.date || !data.fullName || !data.selectedGender
                || !data.address || !data.reason) {  // Check for the reason
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            } else {
                let token = uuidv4();
                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                });

                // Upsert patient    
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        firstName: data.fullName
                    }
                });

                // Create a booking record
                if (user && user[0]) {
                    let booking = await db.Booking.findOrCreate({
                        where: {
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            token: token
                        },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                            reason: data.reason   // Save the reason in the booking record
                        }
                    });

                    // Nếu booking thành công, tăng currentNumber trong bảng Schedule
                    if (booking && booking[1] === true) {  // Check if a new booking was created
                        let schedule = await db.Schedule.findOne({
                            where: {
                                doctorId: data.doctorId,
                                date: data.date,
                                timeType: data.timeType
                            }
                        });

                        if (schedule) {
                            schedule.currentNumber += 1; // Tăng currentNumber
                            await schedule.save(); // Lưu thay đổi vào database
                        }
                    }
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor patient succeed!'
                });
            }
        } catch (e) {
            reject(e);
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



module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment
}