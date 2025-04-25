import examPackageService from '../services/examPackage';

let createExamPackage = async (req, res) => {
    try {
        let infor = await examPackageService.createExamPackage(req.body);
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
        let result = await examPackageService.deleteExamPackage(req.query);
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

let getExamPackageDetailByClinic = async (req, res) => {
    try {
        let infor = await examPackageService.getExamPackageDetailByClinic(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
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
    getExamPackageDetailByClinic
};
