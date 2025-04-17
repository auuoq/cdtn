import clinicService from '../services/clinicService';

let createClinic = async (req, res) => {
    try {
        let infor = await clinicService.createClinic(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let getAllClinic = async (req, res) => {
    try {
        let infor = await clinicService.getAllClinic();
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let getDetailClinicById = async (req, res) => {
    try {
        let infor = await clinicService.getDetailClinicById(req.query.id);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let updateClinic = async (req, res) => {
    try {
        console.log(req.body);  // Để kiểm tra dữ liệu gửi đến server

        let result = await clinicService.updateClinic(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

let deleteClinic = async (req, res) => {
    try {
        let clinicId = req.query.id;
        let result = await clinicService.deleteClinic(clinicId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}


module.exports = {
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
    updateClinic: updateClinic,
    deleteClinic: deleteClinic
}