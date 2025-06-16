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


let updateBookingSchedule = async (req, res) => {
    try {
        let result = await patientService.updateBookingSchedule(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let updateBookingPackageSchedule = async (req, res) => {
    try {
        let result = await patientService.updateBookingPackageSchedule(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
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

let postVerifyDeposit = async (req, res) => {
    try {
        let infor = await patientService.postVerifyDeposit(req.body);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

const checkBookingByQRCode = async (req, res) => {
    try {
        const data = await patientService.checkBookingByQRCode(req.query.type, req.query.token);
        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};


module.exports = {
    postBookAppointment: postBookAppointment,
    updateBookingSchedule: updateBookingSchedule,
    postVerifyBookAppointment: postVerifyBookAppointment,
    postBookExamPackageAppointment: postBookExamPackageAppointment,
    postVerifyBookExamPackageAppointment: postVerifyBookExamPackageAppointment,
    postVerifyDeposit: postVerifyDeposit,
    checkBookingByQRCode: checkBookingByQRCode,
    updateBookingPackageSchedule: updateBookingPackageSchedule,
}