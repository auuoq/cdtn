import axios from '../axios';

const handleLoginApi = (userEmail, userPassword) => {

    return axios.post('/api/login', { email: userEmail, password: userPassword }); //keys must match from backend api
}

const getAllUsers = (inputId) => {
    return axios.get(`/api/get-all-users?id=${inputId}`)
}

const getUserInfoByEmail = (email) => {
    return axios.get(`/api/get-users-by-email?email=${email}`);
}

const getUserBookings = (userId) => {
    return axios.get(`/api/get-user-booking?userId=${userId}`);
}


const deleteAppointment = (appointmentId) => {
    return axios.delete(`/api/delete-appointment?appointmentId=${appointmentId}`);
}


const getDepositInfo = async (appointmentId) => {
    return axios.get(`/api/get-deposit-info?appointmentId=${appointmentId}`);
}

const submitFeedback = (data) => {
    return axios.post('/api/submit-feedback', data);
}

const submitFeedbackPackage = (data) => {
    return axios.post('/api/submit-feedback-package', data);
}

const getUserPackageBookings = (userId) => {
    return axios.get(`/api/get-user-package-booking?userId=${userId}`);
}

const deletePackageAppointment = (appointmentId) => {
    return axios.delete(`/api/delete-package-appointment?appointmentId=${appointmentId}`);
}
const getPackageDepositInfo = (appointmentId) => {
    return axios.get(`/api/get-package-deposit-info?appointmentId=${appointmentId}`);
}

const createNewUserService = (data) => {
    return axios.post('/api/create-new-user', data);
}

const deleteUserService = (userId) => {
    return axios.delete('/api/delete-user', {
        data: {
            id: userId
        }
    });
}

const editUserService = (inputData) => {
    return axios.put('/api/edit-user', inputData);
}

const getAllCodeService = (inputType) => {
    return axios.get(`/api/allcode?type=${inputType}`)
}

export const changePassword = (data) => {
    return axios.post('/api/change-password', data);
};


const getTopDoctorHomeService = (limit) => {
    return axios.get(`/api/top-doctor-home?limit=${limit}`)
}

const getAllDoctors = () => {
    return axios.get(`/api/get-all-doctors`)
}

const searchDoctors = (keyword) => {
    return axios.get(`/api/search-doctors?keyword=${keyword}`);
};


const saveDetailDoctorService = (data) => {
    return axios.post('/api/save-infor-doctors', data);
}

const getDetailInforDoctor = (inputId) => {
    return axios.get(`/api/get-detail-doctor-by-id?id=${inputId}`)
}

const saveBulkScheduleDoctor = (data) => {
    return axios.post('/api/bulk-create-schedule', data);
}

const getScheduleDoctorByDate = (doctorId, date) => {
    return axios.get(`/api/get-schedule-doctor-by-date?doctorId=${doctorId}&date=${date}`);
}

const getExtraInforDoctorById = (doctorId) => {
    return axios.get(`/api/get-extra-infor-doctor-by-id?doctorId=${doctorId}`);
}

const getProfileDoctorById = (doctorId) => {
    return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`);
}

const postPatientBookAppointment = (data) => {
    return axios.post('/api/patient-book-appointment', data);
}

const updateBookingSchedule = (data) => {
    return axios.put('/api/update-booking-schedule', data);
}


const postVerifyBookAppointment = (data) => {
    return axios.post('/api/verify-book-appointment', data);
}

const postBookExamPackageAppointment = (data) => {
    return axios.post('/api/patient-book-exam-package-appointment', data);
};

const postVerifyBookExamPackageAppointment = (data) => {
    return axios.post('/api/verify-book-exam-package-appointment', data);
}

const postVerifyDeposit = (data) => {
    return axios.post('/api/patient-verify-deposit', data);
}

const getDoctorFeedbacks = (doctorId) => {
    return axios.get(`/api/get-doctor-feedbacks?doctorId=${doctorId}`);
}

const toggleIsDisplayedStatus = (bookingId) => {
    return axios.post(`/api/booking-toggle-isdisplayed?bookingId=${bookingId}`);
}

const createNewSpecialty = (data) => {
    return axios.post('/api/create-new-specialty', data);
}

const getAllSpecialty = () => {
    return axios.get(`/api/get-specialty`);
}

const searchSpecialty = (keyword) => {
    return axios.get(`/api/search-specialty?keyword=${keyword}`);
};

const updateSpecialty = (data) => {
    return axios.put('/api/update-specialty', data);
}

const deleteSpecialty = (specialtyId) => {
    return axios.delete(`/api/delete-specialty?id=${specialtyId}`);
}

const getAllDetailSpecialtyById = (data) => {
    return axios.get(`/api/get-detail-specialty-by-id?id=${data.id}&location=${data.location}`);
}

const createNewClinic = (data) => {
    return axios.post('/api/create-new-clinic', data);
}

const getAllClinic = () => {
    return axios.get(`/api/get-clinic`);
}

const searchClinic = (keyword) => {
    return axios.get(`/api/search-clinic?keyword=${keyword}`);
};


const getAllDetailClinicById = (data) => {
    return axios.get(`/api/get-detail-clinic-by-id?id=${data.id}`);
}

const updateClinic = (data) => {
    return axios.put('/api/update-clinic', data);
};

const deleteClinic = (clinicId) => {
    return axios.delete(`/api/delete-clinic?id=${clinicId}`);
};
const getAllPatientForDoctor = (data) => {
    return axios.get(`/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&date=${data.date}`);
}

const getAllPatientsWithStatusS3 = (data) => {
    return axios.get(`/api/get-patients-status-s3?doctorId=${data.doctorId}`);
}

const postSendRemedy = (data) => {
    return axios.post(`/api/send-remedy`, data);
}

const sendPasswordResetEmail = (email) => {
    return axios.post('/api/send-password-reset-email', { email });
};

const resetPassword = (token, password) => {
    return axios.post(`/api/reset-password/${token}`, { password });
};
const getDetailClinicByManager = async (query) => {
    return axios.get(`/api/get-clinic-manager`, {
        params: query
    });
};
const getClinicByManager = (userId) => {
    return axios.get(`/api/get-clinic-by-manager?userId=${userId}`);
}

const getAllDoctorsByMagager = (userId) => {
    return axios.get(`/api/get-all-doctors-by-manager?userId=${userId}`);
}

const getUserBookingsByManager = (userId) => {
    return axios.get(`/api/get-user-bookings-by-manager?userId=${userId}`);
}

const getPackageBookingsByManager = (userId) => {
    return axios.get(`/api/get-package-bookings-by-manager?userId=${userId}`);
}

const getAllClinicManager = async () => {
    return axios.get(`/api/get-all-clinic-manager`);
}
const assignClinicToManager = async (data) => {
    return axios.post('/api/assign-clinic-to-manager', data);
}

//ExamPackage
const createExamPackage = (data, userId) => {
    return axios.post(`/api/create-new-exam-package?id=${userId}`, data);

};

const updateExamPackage = (data, userId) => {
    return axios.put('/api/update-exam-package', data);
};

const deleteExamPackage = (packageId, userId) => {
    return axios.delete(`/api/delete-exam-package?packageId=${packageId}&userId=${userId}`);
};

const getAllExamPackages = () => {
    return axios.get('/api/get-all-exam-packages');
}

const searchExamPackage = (keyword) => {
    return axios.get(`/api/search-exam-package?keyword=${keyword}`);
};


const getExamPackagesDetailByManager = (userId) => {
    return axios.get(`/api/get-exam-package-detail-by-manager?id=${userId}`);
}
const bulkCreateScheduleForPackage = (data) => {
    return axios.post('/api/bulk-create-schedule-for-package', data);
}
const getDetailExamPackageById = (packageId) => {
    return axios.get(`/api/get-detail-exam-package-by-id?id=${packageId}`);
}
const getSchedulePackageByDate = (date, packageId) => {
    return axios.get(`/api/get-schedule-package-by-date?date=${date}&packageId=${packageId}`);
}
const getListAllExamPackagePatientWithStatusS3 = (managerId) => {
    return axios.get(`/api/get-list-all-exam-package-patients-with-status-s3?managerId=${managerId}`);
}
const getListPatientForPackageManager = (data) => {
    return axios.get(`/api/get-list-patient-package?managerId=${data.managerId}&date=${data.date}`);
}

const getPackageFeedbacks = (packageId) => {
    return axios.get(`/api/get-package-feedbacks?packageId=${packageId}`);
}

const toggleIsDisplayedStatusForPackage = (bookingPackageId) => {
    return axios.patch(`/api/toggle-is-displayed-status-for-package?bookingPackageId=${bookingPackageId}`);
}

const sendRemedyForPackage = (data) => {
    return axios.post(`/api/send-remedy-package`, data);
}

const toggleOnlineStatus = (userId) => {
    return axios.patch('/api/toggle-online', { userId });
};

const getOnlineDoctors = () => {
    return axios.get('/api/get-online-doctors');
};

const sendMessage = (data) => {
    return axios.post('/api/send-message', data);
};

const getMessagesBetweenUsers = (userId1, userId2) => {
    return axios.get(`/api/get-messages?userId1=${userId1}&userId2=${userId2}`);
};

const getUserConversations = (userId) => {
    return axios.get(`/api/get-messages-by-user?userId=${userId}`);
}


const paymentMomo = (data) => {
    return axios.post('/payment', data);
}

const callbackMomo = (data) => {
    return axios.post('/callback', data);
}

const transactionStatusMomo = (data) => {
    return axios.post('/transaction-status', data);
}

const getDepositReport = (from, to) => {
    return axios.get(`/api/deposit-report?from=${from}&to=${to}`);
}

const getDepositReportByManager = (userId, from, to) => {
    return axios.get(`/api/deposit-report-by-manager?userId=${userId}&from=${from}&to=${to}`);
}

const getDepositReportByClinic = (clinicId, from, to) => {
    return axios.get(`/api/deposit-report-by-clinic?clinicId=${clinicId}&from=${from}&to=${to}`);
}
const toggleTransactionStatus = (transactionId) => {
    return axios.put(`/api/toggle-status?transactionId=${transactionId}`);
}
const toggleStatusForClinic = (clinicId, from, to) => {
    return axios.put(`/api/toggle-status-by-clinic?clinicId=${clinicId}&from=${from}&to=${to}`);
}

export {
    handleLoginApi, getAllUsers,
    createNewUserService, deleteUserService,
    editUserService, getAllCodeService, getTopDoctorHomeService,
    getAllDoctors, saveDetailDoctorService,
    getDetailInforDoctor, saveBulkScheduleDoctor,
    getScheduleDoctorByDate, getExtraInforDoctorById,
    getProfileDoctorById, postPatientBookAppointment,
    postVerifyBookAppointment, createNewSpecialty,
    getAllSpecialty, getAllDetailSpecialtyById,
    createNewClinic, getAllClinic, getAllDetailClinicById, updateClinic, deleteClinic,
    getAllPatientForDoctor, postSendRemedy, getAllPatientsWithStatusS3,
    getUserInfoByEmail, getUserBookings, deleteAppointment, getDepositInfo,
    sendPasswordResetEmail, resetPassword, getDetailClinicByManager, getClinicByManager, getAllDoctorsByMagager,
    getUserBookingsByManager, deleteSpecialty, updateSpecialty, getAllClinicManager, assignClinicToManager, getAllExamPackages,
    createExamPackage, updateExamPackage, deleteExamPackage, getExamPackagesDetailByManager, bulkCreateScheduleForPackage, 
    getDetailExamPackageById,getSchedulePackageByDate, getListAllExamPackagePatientWithStatusS3, 
    getPackageDepositInfo, postBookExamPackageAppointment, postVerifyBookExamPackageAppointment,postVerifyDeposit,
    getUserPackageBookings, deletePackageAppointment, getPackageBookingsByManager, toggleOnlineStatus, 
    getOnlineDoctors, sendMessage, getMessagesBetweenUsers, getUserConversations, submitFeedback,
    getListPatientForPackageManager, sendRemedyForPackage,searchDoctors, getDoctorFeedbacks, 
    toggleIsDisplayedStatus, getPackageFeedbacks, toggleIsDisplayedStatusForPackage, 
    submitFeedbackPackage,searchClinic,searchSpecialty,searchExamPackage,
    paymentMomo, callbackMomo, transactionStatusMomo, getDepositReport, 
    getDepositReportByManager, getDepositReportByClinic,toggleTransactionStatus,
    toggleStatusForClinic, updateBookingSchedule
}
