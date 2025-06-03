import React, { useState, useEffect } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = "AIzaSyBvHL-oNWEQG9xx1IkpNgP-0CqnZ61hZ8c";

function ChatBot() {
  const [doctorsData, setDoctorsData] = useState([]);
  const [messages, setMessages] = useState([
    {
      message: "Chào mừng bạn đến với TDH Booking, bạn có câu hỏi nào không ?",
      sentTime: "just now",
      sender: "Gemini",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("http://localhost:8080/api/get-all-doctors"); // Thay URL API thật
        const json = await res.json();
        if (json.errCode === 0 && json.data) {
          const mapped = json.data
            .filter(
              (doc) =>
                doc.Doctor_Infor &&
                doc.Doctor_Infor.specialtyData &&
                doc.Doctor_Infor.specialtyData.name
            )
            .map((doc) => ({
              name: `${doc.firstName} ${doc.lastName}`,
              specialty: doc.Doctor_Infor.specialtyData.name.trim().toLowerCase(),
              clinic: doc.Doctor_Infor.nameClinic || "chưa có phòng khám",
              advice: `Bạn có thể tham khảo Bác sĩ ${doc.firstName} ${doc.lastName} chuyên khoa ${doc.Doctor_Infor.specialtyData.name.trim()} tại ${doc.Doctor_Infor.nameClinic || "phòng khám chưa rõ"}.`,
            }));
          setDoctorsData(mapped);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách bác sĩ:", error);
      }
    }
    fetchDoctors();
  }, []);

  function suggestDoctor(question, doctors) {
    question = question.toLowerCase();

    for (let doc of doctors) {
      const specialty = doc.specialty.trim().toLowerCase() || "";
      console.log(`Checking doctor: ${doc.name}, specialty: ${doc.specialty}`);

      if (specialty && question.includes(specialty)) {
        return `Bạn có thể tham khảo Bác sĩ ${doc.name} chuyên khoa ${specialty} tại ${doc.clinic|| "phòng khám"} nhé.`;
      }
    }
    return null;
  }


  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);

    const localAnswer = suggestDoctor(message, doctorsData);

    if (localAnswer) {
      setMessages([
        ...newMessages,
        {
          message: localAnswer,
          sender: "Gemini",
        },
      ]);
      setIsTyping(false);
    } else {
      await processMessageToGemini(newMessages);
    }
  };

  async function processMessageToGemini(chatMessages) {
    const userMessage = chatMessages[chatMessages.length - 1].message;

    const requestBody = {
      contents: [
        {
          parts: [{ text: userMessage }],
        },
      ],
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't understand.";

      setMessages([
        ...chatMessages,
        {
          message: reply,
          sender: "Gemini",
        },
      ]);
    } catch (error) {
      console.error("Gemini API error:", error);
      setMessages([
        ...chatMessages,
        {
          message: "Error connecting to Gemini API.",
          sender: "Gemini",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "380px", width: "100%" }}>

        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="Gemini đang soạn tin..." /> : null}
            >
              {messages.map((message, i) => (
                <Message
                  key={i}
                  model={{
                    message: message.message,
                    sentTime: message.sentTime,
                    sender: message.sender,
                    direction: message.sender === "user" ? "outgoing" : "incoming",
                  }}
                />
              ))}
            </MessageList>
            <MessageInput placeholder="Nhập tin nhắn" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default ChatBot;
