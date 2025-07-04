import clinicManagerService from "../services/clinicManagerService";

let getDetailClinicByManagerUserId = async (req, res) => {
    try {
        let response = await clinicManagerService.getDetailClinicByManagerUserId(req.query);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
};

let getClinicByManager = async (req, res) => {
    try {
        let response = await clinicManagerService.getClinicByManager(req.query.userId);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
}

let getAllDoctorsByMagager = async (req, res) => {
    try {
        let response = await clinicManagerService.getAllDoctorsByMagager(req.query.userId);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
}

let getUserBookingsByManager = async (req, res) => {
    try {
        let response = await clinicManagerService.getUserBookingsByManager(req.query.userId);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
}

let getAllClinicManager = async (req, res) => {
    try {
        let ClinicManager = await clinicManagerService.getAllClinicManager();
        return res.status(200).json(ClinicManager);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let assignClinicToManager = async (req, res) => {
    try {
        let response = await clinicManagerService.assignClinicToManager(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
}

let getPackageBookingsByManager = async (req, res) => {
    try {
        let response = await clinicManagerService.getPackageBookingsByManager(req.query.userId);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
}


let getListPatientForPackageManager = async (req, res) => {
    try {
        let data = await clinicManagerService.getListPatientForPackageManager(req.query.managerId, req.query.date);
        return res.status(200).json(data);
    } catch (e) {
        console.log("Error getListPatientForPackageManager:", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let sendRemedyForPackage = async (req, res) => {
    try {
        let infor = await clinicManagerService.sendRemedyForPackage(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

const getDepositReportByManager = async (req, res) => {
  try {
    const { userId, from, to } = req.query;
    const result = await clinicManagerService.getDepositReportByManager(userId, from, to);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getDepositReportByManager:', error);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Lỗi server'
    });
  }
};


module.exports = {
    getDetailClinicByManagerUserId: getDetailClinicByManagerUserId,
    getClinicByManager: getClinicByManager,
    getAllDoctorsByMagager: getAllDoctorsByMagager,
    getUserBookingsByManager: getUserBookingsByManager,
    getAllClinicManager: getAllClinicManager,
    assignClinicToManager: assignClinicToManager,
    getPackageBookingsByManager: getPackageBookingsByManager,
    getListPatientForPackageManager: getListPatientForPackageManager,
    sendRemedyForPackage: sendRemedyForPackage,
    getDepositReportByManager: getDepositReportByManager
};
