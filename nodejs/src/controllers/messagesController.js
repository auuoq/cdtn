import messagesService from '../services/messagesService.js';

let toggleOnlineStatus = async (req, res) => {
    try {
        const userId = req.body.userId;
        let result = await messagesService.toggleOnlineStatus(userId);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
};


let getOnlineDoctors = async (req, res) => {
    try {
        let result = await messagesService.getOnlineDoctors();
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Server error'
        });
    }
};

let sendMessage = async (req, res) => {
    try {
        const result = await messagesService.sendMessage(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
};

let getMessagesBetweenUsers = async (req, res) => {
    try {
        const result = await messagesService.getMessagesBetweenUsers(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
};

module.exports = {
    toggleOnlineStatus: toggleOnlineStatus,
    getOnlineDoctors: getOnlineDoctors,
    sendMessage: sendMessage,
    getMessagesBetweenUsers: getMessagesBetweenUsers,
};