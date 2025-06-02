const axios = require('axios');
require('dotenv').config();

const getChatResponse = async (prompt) => {
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt không hợp lệ');
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo';

    const requestBody = {
        model: model,
        messages: [{ role: "user", content: prompt }]
    };

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error('❌ Lỗi gọi OpenAI API:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || 'Lỗi gọi ChatGPT');
    }
};

module.exports = {
    getChatResponse
};
