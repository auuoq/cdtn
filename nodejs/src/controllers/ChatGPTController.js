import chatGPTService from '../services/ChatGPTService';

const handleChatRequest = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ errCode: 1, errMessage: 'Thiếu hoặc sai định dạng prompt' });
    }

    try {
        const response = await chatGPTService.getChatResponse(prompt);
        return res.status(200).json({
            errCode: 0,
            data: response
        });
    } catch (error) {
        console.error('❌ Lỗi xử lý ChatGPT:', error.message);
        return res.status(500).json({
            errCode: -1,
            errMessage: error.message || 'Lỗi server'
        });
    }
};

module.exports = {
    handleChatRequest
};
