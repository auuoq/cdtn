import patientService from '../services/patientService'

let postBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postBookAppointment(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server1111'
        })
    }
}

let postVerifyBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postVerifyBookAppointment(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

//package
let postBookExamPackageAppointment = async (req, res) => {
    try {
        let infor = await patientService.postBookExamPackageAppointment(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}
let postVerifyBookExamPackageAppointment = async (req, res) => {
    try {
        let infor = await patientService.postVerifyBookExamPackageAppointment(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}


module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    postBookExamPackageAppointment: postBookExamPackageAppointment,
    postVerifyBookExamPackageAppointment: postVerifyBookExamPackageAppointment
}