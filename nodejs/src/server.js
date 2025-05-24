import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import connectDB from './config/connectDB';
import cors from 'cors';
import http from 'http'; // 👈 Thêm dòng này
import { Server as SocketIO } from 'socket.io'; // 👈 Thêm dòng này

require('dotenv').config();

let app = express();
let server = http.createServer(app); // 👈 Tạo HTTP server từ express app
let io = new SocketIO(server, {
    cors: {
        origin: "*", // 👈 Cho phép mọi domain kết nối (hoặc cấu hình domain cụ thể)
        methods: ["GET", "POST"]
    }
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected");

    // Khi người dùng online
    socket.on("setUserOnline", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    // Khi gửi tin nhắn
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("receiveMessage", { senderId, message });
        }
    });

    // Khi disconnect
    socket.on("disconnect", () => {
        for (let [userId, socketId] of onlineUsers) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        console.log("A user disconnected");
    });
});

// Config Express App
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

viewEngine(app);
initWebRoutes(app);
connectDB();

let port = process.env.PORT || 6969;
app.listen(port, () => {
    console.log("Backend Nodejs is running on the port : " + port);
});
