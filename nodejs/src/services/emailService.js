require('dotenv').config();
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';

// Tạo transporter dùng SendGrid API
const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  }
}));

// Hàm gửi email đơn giản
let sendSimpleEmail = async (dataSend) => {
  // Chọn subject tùy type
  const subject = dataSend.type === 'package'
    ? (dataSend.language === 'vi'
        ? 'Thông tin đặt lịch gói khám'
        : 'Your Exam Package Booking Info')
    : (dataSend.language === 'vi'
        ? 'Thông tin đặt lịch khám bệnh'
        : 'Your Appointment Booking Info');

  await transporter.sendMail({
    from: '"BKCare 👻" <datbon1810@gmail.com>', // email này cần verify trong SendGrid
    to: dataSend.receiverEmail,
    subject,
    html: getBodyHTMLEmail(dataSend),
  });
};

// Nội dung email (giữ nguyên logic của bạn)
let getBodyHTMLEmail = (dataSend) => {
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
};

// Gửi email có file đính kèm (cho bác sĩ)
let sendAttachment = async (dataSend) => {
  await transporter.sendMail({
    from: '"BKCare 👻" <datbon1810@gmail.com>',
    to: dataSend.email,
    subject: "Kết quả đặt lịch khám bệnh",
    html: getBodyHTMLEmailRemedy(dataSend),
    attachments: [
      {
        filename: `remedy-${dataSend.patientId}-${Date.now()}.png`,
        content: dataSend.imgBase64.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  });
};

// Gửi email có file đính kèm (cho gói khám)
let sendAttachmentForPackage = async (dataSend) => {
  await transporter.sendMail({
    from: '"BKCare 👨‍⚕️" <datbon1810@gmail.com>',
    to: dataSend.email,
    subject: "Kết quả gói khám sức khỏe",
    html: getBodyHTMLEmailRemedy(dataSend),
    attachments: [
      {
        filename: `remedy-${dataSend.patientId}-${Date.now()}.png`,
        content: dataSend.imgBase64.split("base64,")[1],
        encoding: 'base64'
      }
    ]
  });
};

let getBodyHTMLEmailRemedy = (dataSend) => {
  if (dataSend.language === 'vi') {
    return `
      <h3>Xin chào ${dataSend.patientName}!</h3>
      <p>Bạn nhận được email này vì đã hoàn thành lịch khám bệnh đã đặt trên BKCare!</p>
      <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm:</p>
      <div>Xin chân thành cảm ơn</div>
    `;
  } else {
    return `
      <h3>Dear ${dataSend.patientName}!</h3>
      <p>You received this email because you have completed the appointment you booked on BKCare!</p>
      <p>Information on prescription/receipt is included below:</p>
      <div>Sincerely thank!</div>
    `;
  }
};

// Gửi email đặt lại mật khẩu
let sendPasswordResetEmail = async (dataSend) => {
  await transporter.sendMail({
    from: '"BKCare 👻" <datbon1810@gmail.com>',
    to: dataSend.receiverEmail,
    subject: "Đặt lại mật khẩu",
    html: getBodyHTMLEmailResetPassword(dataSend),
  });
};

let getBodyHTMLEmailResetPassword = (dataSend) => {
  if (dataSend.language === 'vi') {
    return `
      <h3>Xin chào ${dataSend.patientName}!</h3>
      <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu trên BKCare.</p>
      <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
      <div>
        <a href=${dataSend.redirectLink} target="_blank">Đặt lại mật khẩu</a>
      </div>
      <div>Xin chân thành cảm ơn!</div>
    `;
  } else {
    return `
      <h3>Dear ${dataSend.patientName}!</h3>
      <p>You received this email because you requested a password reset on BKCare.</p>
      <p>Please click the link below to reset your password:</p>
      <div>
        <a href=${dataSend.redirectLink} target="_blank">Reset Password</a>
      </div>
      <div>Sincerely thank!</div>
    `;
  }
};

module.exports = {
  sendSimpleEmail,
  sendAttachment,
  sendAttachmentForPackage,
  sendPasswordResetEmail,
  getBodyHTMLEmail,
  getBodyHTMLEmailRemedy,
  getBodyHTMLEmailResetPassword,
};
