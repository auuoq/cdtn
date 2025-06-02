// openaiConfig.js
const axios = require('axios');

// Lấy API Key từ biến môi trường (giống @Value của Spring Boot)
const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions'; // Ví dụ endpoint của OpenAI

// Tạo axios instance tương tự như RestTemplate với cấu hình baseURL và headers
const openaiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});

// Export client và key để các module khác có thể sử dụng
module.exports = {
  openaiClient,
  apiKey
};
