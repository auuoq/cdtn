import express, { Router } from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController";
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController";
import clinicManagerController from "../controllers/manage_clinicController";
import examPackageController from "../controllers/examPackageController";
import messageController from "../controllers/messagesController";
import ChatGPTController from "../controllers/ChatGPTController";
import MomoController from "../controllers/MomoController";

let router = express.Router();

let initWebRoutes = (app) => {
    //test some routes - server render ejs
    router.get('/', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud', homeController.getCRUD);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/get-crud', homeController.displayGetCRUD);
    router.get('/edit-crud', homeController.getEditCRUD);
    router.post('/put-crud', homeController.putCRUD);
    router.get('/delete-crud', homeController.deleteCRUD);

    //apis
    //users
    router.post('/api/login', userController.handleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.get('/api/get-users-by-email', userController.handleGetAllUsersByEmail);
    router.post('/api/create-new-user', userController.handleCreateNewUser);
    router.put('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);
    router.get('/api/allcode', userController.getAllCode);
    router.get('/api/get-user-booking', userController.getUserBookings);
    router.delete('/api/delete-appointment', userController.deleteAppointment);
    router.get('/api/get-deposit-info', userController.getDepositInfo);
    router.post('/api/submit-feedback', userController.submitFeedback);
    router.get('/api/submit-feedback-package', userController.submitFeedbackPackage);
    router.get('/api/get-user-package-booking', userController.handleGetUserPackageBookings);
    router.delete('/api/delete-package-appointment', userController.handleDeletePackageAppointment);
    router.get('/api/get-package-deposit-info', userController.handleGetDepositInfoPackage);
    router.post('/api/send-password-reset-email', userController.handleSendPasswordResetEmail);
    router.post('/api/reset-password/:token', userController.handleResetPassword);
    app.post('/api/change-password', userController.handleChangePassword);



    //doctors
    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    router.get('/api/get-all-doctors', doctorController.getAllDoctors);
    router.post('/api/save-infor-doctors', doctorController.postInforDoctor);
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);
    router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExtraInforDoctorById);
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    router.get('/api/get-doctor-feedbacks', doctorController.getDoctorFeedbacks);
    router.post('/api/booking-toggle-isdisplayed', doctorController.toggleIsDisplayedStatus);
    router.get('/api/search-doctors', doctorController.searchDoctorsController);



    //doctor-manage patient
    router.get('/api/get-list-patient-for-doctor', doctorController.getListPatientForDoctor);
    router.get('/api/get-patients-status-s3', doctorController.getListAllPatientWithStatusS3);

    //doctors-send remedy
    router.post('/api/send-remedy', doctorController.sendRemedy);


    //patient
    router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    router.put('/api/update-booking-schedule', patientController.updateBookingSchedule);
    router.put('/api/update-booking-package-schedule', patientController.updateBookingPackageSchedule); // Lấy lịch hẹn của người dùng
    router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
    router.post('/api/patient-book-exam-package-appointment', patientController.postBookExamPackageAppointment); // Đặt lịch khám cho gói khám
    router.post('/api/verify-book-exam-package-appointment', patientController.postVerifyBookExamPackageAppointment); // Xác nhận lịch khám cho gói khám
    router.post('/api/patient-verify-deposit', patientController.postVerifyDeposit); // Xác nhận đặt cọc
    router.get('/api/check-booking-by-qr-code', patientController.checkBookingByQRCode); // Kiểm tra lịch hẹn bằng mã QR

    //specialty
    router.post('/api/create-new-specialty', specialtyController.createSpecialty);
    router.get('/api/get-specialty', specialtyController.getAllSpecialty);
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);
    router.put('/api/update-specialty', specialtyController.updateSpecialty);
    router.delete('/api/delete-specialty', specialtyController.deleteSpecialty);
    router.get('/api/search-specialty', specialtyController.searchSpecialtyByName);



    //clinic
    router.post('/api/create-new-clinic', clinicController.createClinic);
    router.get('/api/get-clinic', clinicController.getAllClinic);
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);
    router.put('/api/update-clinic', clinicController.updateClinic);
    router.delete('/api/delete-clinic', clinicController.deleteClinic);
    router.get('/api/search-clinic', clinicController.searchClinicByName);


    //Clinic_Manager
    router.get('/api/get-clinic-manager', clinicManagerController.getDetailClinicByManagerUserId);
    router.get('/api/get-clinic-by-manager', clinicManagerController.getClinicByManager);
    router.get('/api/get-all-doctors-by-manager', clinicManagerController.getAllDoctorsByMagager);
    router.get('/api/get-user-bookings-by-manager', clinicManagerController.getUserBookingsByManager);
    router.get('/api/get-package-bookings-by-manager', clinicManagerController.getPackageBookingsByManager);
    router.get('/api/get-all-clinic-manager', clinicManagerController.getAllClinicManager);
    router.post('/api/assign-clinic-to-manager', clinicManagerController.assignClinicToManager);
    router.get("/api/get-list-patient-package", clinicManagerController.getListPatientForPackageManager);
    router.post('/api/send-remedy-package', clinicManagerController.sendRemedyForPackage);



    //Exam Package
    router.post('/api/create-new-exam-package', examPackageController.createExamPackage);  // Tạo mới gói khám
    router.put('/api/update-exam-package', examPackageController.updateExamPackage);       // Cập nhật gói khám
    router.delete('/api/delete-exam-package', examPackageController.deleteExamPackage);    // Xóa gói khám
    router.get('/api/get-all-exam-packages', examPackageController.getAllExamPackages);    // Lấy tất cả gói khám
    router.get('/api/get-exam-package-detail-by-manager', examPackageController.getExamPackagesDetailByManager); // Lấy chi tiết gói khám theo phòng khám
    router.post('/api/bulk-create-schedule-for-package', examPackageController.bulkCreateScheduleForPackage); // Tạo lịch khám cho gói khám
    router.get('/api/get-detail-exam-package-by-id', examPackageController.getDetailExamPackageById);
    router.get('/api/get-schedule-package-by-date', examPackageController.getSchedulePackageByDate); // Lấy lịch khám theo ngày cho gói khá
    router.get('/api/get-list-all-exam-package-patients-with-status-s3', examPackageController.getListAllExamPackagePatientWithStatusS3); // Lấy danh sách bệnh nhân theo gói khám với trạng thái S3
    router.get('/api/get-package-feedbacks', examPackageController.getPackageFeedbacks); // Lấy phản hồi của gói khám
    router.patch('/api/toggle-is-displayed-status-for-package', examPackageController.toggleIsDisplayedStatusForPackage); // Chuyển đổi trạng thái hiển thị cho gói khám
    router.get('/api/search-exam-package', examPackageController.searchExamPackageByName);

    //message
    router.patch('/api/toggle-online', messageController.toggleOnlineStatus);
    router.get('/api/get-online-doctors', messageController.getOnlineDoctors);
    router.post('/api/send-message', messageController.sendMessage);
    router.get('/api/get-messages', messageController.getMessagesBetweenUsers);
    router.get('/api/get-messages-by-user', messageController.getUserConversations);

    router.post('/api/chat-bot', ChatGPTController.handleChatRequest);

    //payment
    router.post('/payment', MomoController.paymentMomo); // Tạo thanh toán Momo
    router.post('/callback', MomoController.callback); // Callback từ Momo
    router.post('/transaction-status', MomoController.transactionStatus); // Xử lý giao dịch Momo
    router.get('/api/deposit-report', userController.getDepositReport);
    router.get('/api/deposit-report-by-clinic', userController.GetDepositReportByClinic);
    router.get('/api/deposit-report-by-manager', clinicManagerController.getDepositReportByManager);
    router.put('/api/toggle-status', userController.toggleTransactionStatus);
    router.put('/api/toggle-status-by-clinic', userController.toggleStatusForClinic);

    return app.use("/", router);
}

module.exports = initWebRoutes;