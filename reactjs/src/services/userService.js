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


const deleteAppointment = async (appointmentId) => {
    try {
        const response = await axios.delete(`/api/delete-appointment`, {
            params: { appointmentId }
        });
        return response.data || {}; // Trả về đối tượng rỗng nếu không có dữ liệu
    } catch (error) {
        console.error('Lỗi khi gọi API xóa:', error.response ? error.response.data : error.message);
        return {}; // Đảm bảo rằng luôn trả về đối tượng, ngay cả khi có lỗi
    }
}

const getDepositInfo = async (appointmentId) => {
    return axios.get(`/api/get-deposit-info?appointmentId=${appointmentId}`);
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

const postVerifyBookAppointment = (data) => {
    return axios.post('/api/verify-book-appointment', data);
}

const createNewSpecialty = (data) => {
    return axios.post('/api/create-new-specialty', data);
}

const getAllSpecialty = () => {
    return axios.get(`/api/get-specialty`);
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
    createNewClinic, getAllClinic, getAllDetailClinicById,updateClinic,deleteClinic,
    getAllPatientForDoctor, postSendRemedy,getAllPatientsWithStatusS3,
    getUserInfoByEmail,getUserBookings,deleteAppointment,getDepositInfo,
    sendPasswordResetEmail,resetPassword,getDetailClinicByManager,getClinicByManager,getAllDoctorsByMagager,
    getUserBookingsByManager
}
