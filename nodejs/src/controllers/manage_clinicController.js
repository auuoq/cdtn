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

module.exports = {
    getDetailClinicByManagerUserId: getDetailClinicByManagerUserId,
    getClinicByManager: getClinicByManager,
    getAllDoctorsByMagager: getAllDoctorsByMagager,
    getUserBookingsByManager: getUserBookingsByManager,
    getAllClinicManager: getAllClinicManager,
    assignClinicToManager: assignClinicToManager,
    getPackageBookingsByManager: getPackageBookingsByManager
};
