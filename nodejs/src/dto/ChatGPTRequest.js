// dto/ChatGPTRequest.js
class ChatGPTRequest {
    constructor(module, messages) {
        this.module = module;
        this.messages = messages.map(msg => new Message(msg.role, msg.content));
    }
}

class Message {
    constructor(role, content) {
        this.role = role;
        this.content = content;
    }
}

module.exports = { ChatGPTRequest, Message };
