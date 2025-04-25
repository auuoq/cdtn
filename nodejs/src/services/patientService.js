import db from "../models/index"
require('dotenv').config();
import emailService from './emailService'
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (doctorId, packageId, token) => {
    let result = '';
    
    if (doctorId) {
        result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
    }
    
    if (packageId) {
        result = `${process.env.URL_REACT}/verify-booking?token=${token}&packageId=${packageId}`;
    }

    return result;
}


let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || (!data.doctorId && !data.packageId) || !data.timeType
                || !data.date || !data.fullName || !data.selectedGender
                || !data.address || !data.reason) {  // Check for the reason and either doctorId or packageId
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
                    // Thay doctorId bằng packageId nếu người dùng chọn gói khám
                    redirectLink: buildUrlEmail(data.doctorId, data.packageId, token)
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
                            packageId: data.packageId, // Include packageId if provided
                            token: token
                        },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                            reason: data.reason, // Save the reason in the booking record
                            packageId: data.packageId // Save packageId if the booking is for an exam package
                        }
                    });

                    // If booking is created, increase the current number for the schedule
                    if (booking && booking[1] === true) {  // Check if a new booking was created
                        let schedule = await db.Schedule.findOne({
                            where: {
                                doctorId: data.doctorId,
                                date: data.date,
                                timeType: data.timeType
                            }
                        });

                        if (schedule) {
                            schedule.currentNumber += 1; // Increment currentNumber
                            await schedule.save(); // Save the change to the database
                        }
                    }
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save info patient succeed!'
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
            if (!data.token || (!data.doctorId && !data.packageId)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        ...(data.doctorId ? { doctorId: data.doctorId } : {}),
                        ...(data.packageId ? { packageId: data.packageId } : {}),
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