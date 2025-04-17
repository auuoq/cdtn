import userService from '../services/userService';

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing input parameter!'
        })
    }

    let userData = await userService.handleUserLogin(email, password);
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

let handleGetAllUsers = async (req, res) => {
    let id = req.query.id; //ALL or id

    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameter',
            users: []
        })
    }

    let users = await userService.getAllUsers(id);
    // console.log(users);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users
    })
}

let handleGetAllUsersByEmail = async (req, res) => {
    let email = req.query.email; // Giả sử bạn lấy email từ query params

    if (!email) {
        return res.status(500).json({
            errCode: 1,
            errMessage: "Missing required parameter!"
        });
    }

    let userInfo = await userService.getUserInfoByEmail(email); // Gọi hàm getUserInfoByEmail từ userService
    return res.status(200).json({
        errCode: userInfo.errCode,
        errMessage: userInfo.errMessage,
        data: userInfo.data ? userInfo.data : {}
    });
};

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message);
}

let handleDeleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameters"
        })
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

let handleEditUser = async (req, res) => {
    let data = req.body;
    let message = await userService.updateUserData(data);
    return res.status(200).json(message);
}

let getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch (e) {
        console.log('Get all code error: ', e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
}



let getUserBookings = async (req, res) => {
    try {
        let userId = req.query.userId; // Lấy userId từ query params
        if (!userId) {
            return res.status(500).json({
                errCode: 1,
                errMessage: "Missing required parameter!"
            });
        }

        let bookings = await userService.getUserBookings(userId);
        return res.status(200).json({
            errCode: bookings.errCode,
            errMessage: bookings.errMessage,
            data: bookings.data ? bookings.data : []
        });
    } catch (e) {
        console.error('Error in getUserBookings:', e); // Thêm thông báo lỗi chi tiết vào console
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
}

// Cập nhật hàm deleteAppointment trong userController
// Cập nhật hàm deleteAppointment trong userController
let deleteAppointment = async (req, res) => {
    const { appointmentId } = req.query;

    if (!appointmentId) {
        return res.status(400).json({
            errCode: 1,
            errMessage: "Thiếu tham số cần thiết"
        });
    }

    try {
        let message = await userService.deleteAppointment(appointmentId);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(500).json({
            errCode: 3,
            errMessage: "Lỗi khi xóa lịch hẹn"
        });
    }
};

const getDepositInfo = async (req, res) => {
    try {
        let appointmentId = req.query.appointmentId; // Lấy từ query params
        
        if (!appointmentId) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing required parameter: appointmentId'
            });
        }

        let depositInfo = await userService.getDepositInfo(appointmentId);

        return res.status(200).json({
            errCode: 0,
            errMessage: 'OK',
            data: depositInfo
        });

    } catch (error) {
        console.error('Error in getDepositInfo:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
}


let handleSendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Thiếu email!'
        });
    }

    try {
        let message = await userService.handleSendPasswordResetEmail(email);
        return res.status(200).json(message);
    } catch (e) {
        console.error('Error in handleSendPasswordResetEmail:', e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
        });
    }
};


let handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
        return res.status(400).json({
            errCode: 1,
            errMessage: 'Thiếu tham số cần thiết!'
        });
    }

    try {
        let message = await userService.handleResetPassword(token, password);
        return res.status(200).json(message);
    } catch (e) {
        console.error('Error in handleResetPassword:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi từ server'
        });
    }
};

let handleChangePassword = async (req, res) => {
    let userId = req.body.userId;
    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({
            errCode: 1,
            errMessage: "Missing required parameters",
        });
    }

    let response = await userService.handleChangePassword(userId, currentPassword, newPassword);
    return res.status(200).json(response);
};

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode,
    handleGetAllUsersByEmail: handleGetAllUsersByEmail,
    getUserBookings: getUserBookings,
    deleteAppointment: deleteAppointment,
    getDepositInfo: getDepositInfo,
    handleResetPassword: handleResetPassword,
    handleSendPasswordResetEmail: handleSendPasswordResetEmail,
    handleChangePassword: handleChangePassword
}