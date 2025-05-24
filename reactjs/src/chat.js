import { io } from 'socket.io-client';

// Kết nối tới backend
const socket = io('http://localhost:8080')                                        

// Sau khi kết nối, gửi userId để đánh dấu online
const userId = '123'; // ID của người dùng hiện tại (bác sĩ hoặc bệnh nhân)
socket.emit('setUserOnline', userId);

// Gửi tin nhắn
const sendMessage = (receiverId, message) => {
  socket.emit('sendMessage', {
    senderId: userId,
    receiverId: receiverId,
    message: message
  });
};

// Nhận tin nhắn
socket.on('receiveMessage', (data) => {
  console.log("Tin nhắn mới:", data);
});
