// dto/ChatGPTResponse.js
class ChatGPTResponse {
    constructor(choices) {
        this.choices = choices.map(choice => new Choice(choice.message));
    }
}

class Choice {
    constructor(message) {
        this.message = new Message(message.role, message.content);
    }
}

class Message {
    constructor(role, content) {
        this.role = role;
        this.content = content;
    }
}

module.exports = { ChatGPTResponse, Choice, Message };
