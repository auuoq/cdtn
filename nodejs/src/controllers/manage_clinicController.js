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

module.exports = {
    getDetailClinicByManagerUserId: getDetailClinicByManagerUserId,
    getClinicByManager: getClinicByManager,
    getAllDoctorsByMagager: getAllDoctorsByMagager,
    getUserBookingsByManager: getUserBookingsByManager
};
