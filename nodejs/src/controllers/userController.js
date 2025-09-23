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

let getAllcodes = async (req, res) => {
    try {
        let data = await userService.getAllcodesService(req.query.type);
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
        // gọi thẳng service, service sẽ trả về { errCode, errMessage, data }
        let result = await userService.getUserBookings(req.query.userId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in getUserBookings:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let deleteAppointment = async (req, res) => {
    try {
        let result = await userService.deleteAppointment(req.query.appointmentId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in deleteAppointment:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let getDepositInfo = async (req, res) => {
    try {
        let result = await userService.getDepositInfo(req.query.appointmentId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in getDepositInfo:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let submitFeedback = async (req, res) => {
    try {
        let infor = await userService.submitFeedback(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let submitFeedbackPackage = async (req, res) => {
    try {
        let infor = await userService.submitFeedbackPackage(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({   
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};



let handleGetUserPackageBookings = async (req, res) => {
    try {
        let result = await userService.getUserPackageBookings(req.query.userId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in getUserPackageBookings:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let handleDeletePackageAppointment = async (req, res) => {
    try {
        let result = await userService.deletePackageAppointment(req.query.appointmentId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in deletePackageAppointment:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let handleGetDepositInfoPackage = async (req, res) => {
    try {
        let result = await userService.getDepositInfoPackage(req.query.appointmentId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in getDepositInfoPackage:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};


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

let getDepositReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await userService.getDepositReport(from, to);

    if (data.errCode !== 0) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);

  } catch (e) {
    console.error('Error in getDepositReport:', e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Internal server error'
    });
  }
};

let GetDepositReportByClinic = async (req, res) => {
  const { clinicId, from, to } = req.query;
  try {
    const data = await userService.getDepositReportByClinic(clinicId, from, to);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Server error',
    });
  }
};

let toggleTransactionStatus = async (req, res) => {
    try {
        let result = await userService.toggleTransactionStatus(req.query.transactionId);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Failed to toggle transaction status:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let toggleStatusForClinic = async (req, res) => {
    try {
        let { clinicId, from, to } = req.query;

        if (!clinicId || !from || !to) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Thiếu tham số bắt buộc'
            });
        }

        let result = await userService.toggleStatusForClinic(clinicId, from, to);
        return res.status(200).json(result);

    } catch (e) {
        console.error('Error in toggleStatusForClinic:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi từ server',
        });
    }
};



module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllcodes: getAllcodes,
    handleGetAllUsersByEmail: handleGetAllUsersByEmail,
    getUserBookings: getUserBookings,
    deleteAppointment: deleteAppointment,
    getDepositInfo: getDepositInfo,
    handleResetPassword: handleResetPassword,
    handleSendPasswordResetEmail: handleSendPasswordResetEmail,
    handleChangePassword: handleChangePassword,
    handleGetUserPackageBookings: handleGetUserPackageBookings,
    handleDeletePackageAppointment: handleDeletePackageAppointment,
    handleGetDepositInfoPackage: handleGetDepositInfoPackage,
    submitFeedback: submitFeedback,
    submitFeedbackPackage: submitFeedbackPackage,
    getDepositReport: getDepositReport,
    GetDepositReportByClinic: GetDepositReportByClinic,
    toggleTransactionStatus: toggleTransactionStatus,
    toggleStatusForClinic: toggleStatusForClinic
}