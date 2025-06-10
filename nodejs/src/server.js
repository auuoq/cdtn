import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import connectDB from './config/connectDB';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { sendMessage } from './services/messagesService';

require('dotenv').config();

const app = express();
app.use(cors({ origin: true }));

// Config app
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

viewEngine(app);
initWebRoutes(app);
connectDB();

// Tạo HTTP server từ express app
const server = http.createServer(app);

// Tạo socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Client phải emit('join', userId) để join room
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('sendMessage', async (data) => {
    console.log('📨 New message received:', data);

    // Lưu vào DB
    const result = await sendMessage(data);
    if (result.errCode === 0) {
      // Gửi tin nhắn real-time tới người nhận
      io.to(data.receiverId.toString()).emit('newMessage', result.data);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Chạy server
const port = process.env.PORT || 6969;
server.listen(port, () => {
  console.log("🚀 Backend Nodejs is running on port " + port);
});