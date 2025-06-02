import examPackageService from '../services/examPackage';

let createExamPackage = async (req, res) => {
    try {
        let infor = await examPackageService.createExamPackage(req.body, req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};


let updateExamPackage = async (req, res) => {
    try {
        let result = await examPackageService.updateExamPackage(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let deleteExamPackage = async (req, res) => {
    try {
        let packageId = req.query.packageId;
        let result = await examPackageService.deleteExamPackage(packageId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let getAllExamPackages = async (req, res) => {
    try {
        let infor = await examPackageService.getAllExamPackages();
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let getExamPackagesDetailByManager = async (req, res) => {
    try {
        let infor = await examPackageService.getExamPackagesDetailByManager(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let bulkCreateScheduleForPackage = async (req, res) => {
    try {
        let infor = await examPackageService.bulkCreateScheduleForPackage(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let getDetailExamPackageById = async (req, res) => {
    try {
        let result = await examPackageService.getDetailExamPackageById(req.query.id);
        return res.status(200).json(result);
    } catch (e) {
        console.log('Error getDetailExamPackageById: ', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

let getSchedulePackageByDate = async (req, res) => {
    try {
        let infor = await examPackageService.getSchedulePackageByDate(req.query.packageId,req.query.date);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

let getListAllExamPackagePatientWithStatusS3 = async (req, res) => {
    try {
        let infor = await examPackageService.getListAllExamPackagePatientWithStatusS3(req.query.managerId);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

let getPackageFeedbacks = async (req, res) => {
    try {
        let infor = await examPackageService.getPackageFeedbacks(req.query.packageId);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let toggleIsDisplayedStatusForPackage = async (req, res) => {
    try {
        let response = await examPackageService.toggleIsDisplayedStatusForPackage(req.query.bookingPackageId);
        return res.status(200).json(response);
    } catch (e) {
        console.log('Error in handleToggleIsDisplayedForPackage:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};


module.exports = {
    createExamPackage,
    updateExamPackage,
    deleteExamPackage,
    getAllExamPackages,
    getExamPackagesDetailByManager,
    bulkCreateScheduleForPackage,
    getDetailExamPackageById,
    getSchedulePackageByDate,
    getListAllExamPackagePatientWithStatusS3,
    getPackageFeedbacks,
    toggleIsDisplayedStatusForPackage
};
