require('dotenv').config();
// const nodemailer = require("nodemailer"); -> old syntax
import nodemailer from 'nodemailer';

let sendSimpleEmail = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // Chọn subject tùy type
    const subject = dataSend.type === 'package'
      ? (dataSend.language === 'vi'
          ? 'Thông tin đặt lịch gói khám'
          : 'Your Exam Package Booking Info')
      : (dataSend.language === 'vi'
          ? 'Thông tin đặt lịch khám bệnh'
          : 'Your Appointment Booking Info');

    await transporter.sendMail({
        from: '"BKCare 👻" <serndev523@gmail.com>',
        to: dataSend.receiverEmail,
        subject,
        html: getBodyHTMLEmail(dataSend),
    });
}

let getBodyHTMLEmail = (dataSend) => {
    // case gói khám
    if (dataSend.type === 'package') {
        if (dataSend.language === 'vi') {
            return `
                <h3>Xin chào ${dataSend.patientName}!</h3>
                <p>Bạn nhận được email này vì đã đặt lịch khám gói <b>${dataSend.packageName}</b> online trên BKCare</p>
                <p>Thông tin gói khám:</p>
                <div><b>Thời gian: ${dataSend.time}</b></div>
                <div><b>Gói khám: ${dataSend.packageName}</b></div>
                <p>Nếu thông tin trên là đúng, vui lòng click vào link để xác nhận:</p>
                <div><a href="${dataSend.redirectLink}" target="_blank">Click here</a></div>
                <div>Xin chân thành cảm ơn</div>
            `;
        } else {
            return `
                <h3>Dear ${dataSend.patientName}!</h3>
                <p>You received this email because you booked the exam package <b>${dataSend.packageName}</b> on BKCare</p>
                <p>Package details:</p>
                <div><b>Time: ${dataSend.time}</b></div>
                <div><b>Package: ${dataSend.packageName}</b></div>
                <p>If correct, please confirm:</p>
                <div><a href="${dataSend.redirectLink}" target="_blank">Click here</a></div>
                <div>Sincerely thank!</div>
            `;
        }
    }

    // case khám bác sĩ (giữ nguyên của bạn)
    if (dataSend.language === 'vi') {
        return `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên BKCare</p>
            <p>Thông tin đặt lịch khám bệnh:</p>
            <div><b>Thời gian khám bệnh: ${dataSend.time}</b></div>
            <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
            <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới
            để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh</p>
            <div><a href=${dataSend.redirectLink} target="_blank">Click here</a></div>
            <div>Xin chân thành cảm ơn</div>
        `;
    } else {
        return `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You received this email because you booked an online medical appointment on BKCare</p>
            <p>Information to schedule an appointment:</p>
            <div><b>Time: ${dataSend.time}</b></div>
            <div><b>Doctor: ${dataSend.doctorName}</b></div>
            <p>If the above information is correct, please click on the link below to confirm and complete the medical appointment booking procedure.</p>
            <div><a href=${dataSend.redirectLink} target="_blank">Click here</a></div>
            <div>Sincerely thank!</div>
        `;
    }
}


let sendAttachment = async (dataSend) => {
    return new Promise(async (resolve, reject) => {
        try {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_APP, // generated ethereal user
                    pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
                },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"BKCare 👻" <serndev523@gmail.com>', // sender address
                to: dataSend.email, // list of receivers
                subject: "Kết quả đặt lịch khám bệnh", // Subject line
                html: getBodyHTMLEmailRemedy(dataSend),
                attachments: [
                    {   //encoded string as an attachment
                        filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
                        content: dataSend.imgBase64.split("base64,")[1],    //this line is the file
                        encoding: 'base64'                                  //define file dataType here
                    }                      //more on this: https://stackoverflow.com/questions/24165410/nodemailer-send-base64-data-uri-as-attachment-how
                ]
            });

            resolve(true);

        } catch (e) {
            reject(e)
        }
    });
}

let getBodyHTMLEmailRemedy = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result =
            `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vì đã hoàn thành lịch khám bệnh đã đặt trên BKCare!</p>
        <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm:</p>

        <div>Xin chân thành cảm ơn</div>
        `
    }
    if (dataSend.language === 'en') {
        result =
            `
        <h3>Dear ${dataSend.patientName}!</h3>
        <p>You received this email because you have completed the appointment you booked on BKCare!</p>
        <p>Information on prescription/receipt is included below:</p>

        <div>Sincerely thank!</div>
        `
    }
    return result;
}

let sendPasswordResetEmail = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"BKCare 👻" <serndev523@gmail.com>',
        to: dataSend.receiverEmail,
        subject: "Đặt lại mật khẩu",
        html: getBodyHTMLEmailResetPassword(dataSend),
    });
};

let getBodyHTMLEmailResetPassword = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu trên BKCare.</p>
            <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
            <div>
                <a href=${dataSend.redirectLink} target="_blank">Đặt lại mật khẩu</a>
            </div>
            <div>Xin chân thành cảm ơn!</div>
        `;
    } else if (dataSend.language === 'en') {
        result = `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You received this email because you requested a password reset on BKCare.</p>
            <p>Please click the link below to reset your password:</p>
            <div>
                <a href=${dataSend.redirectLink} target="_blank">Reset Password</a>
            </div>
            <div>Sincerely thank!</div>
        `;
    }
    return result;
};

module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment,
    sendPasswordResetEmail: sendPasswordResetEmail,
    getBodyHTMLEmail: getBodyHTMLEmail,
    getBodyHTMLEmailRemedy: getBodyHTMLEmailRemedy,
    sendEmail: sendSimpleEmail,
    sendAttachment: sendAttachment,
    sendPasswordResetEmail: sendPasswordResetEmail,
    getBodyHTMLEmailResetPassword: getBodyHTMLEmailResetPassword,


};
