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

let getUserConversations = async (req, res) => {
    try {
        const userId = req.query.userId; // lấy userId từ query params
        const response = await messagesService.getUserConversations(userId);
        return res.status(200).json(response);

    } catch (e) {
        console.error('Error in getUserConversations controller:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server',
        });
    }
};

module.exports = {
    toggleOnlineStatus: toggleOnlineStatus,
    getOnlineDoctors: getOnlineDoctors,
    sendMessage: sendMessage,
    getMessagesBetweenUsers: getMessagesBetweenUsers,
    getUserConversations: getUserConversations
};  