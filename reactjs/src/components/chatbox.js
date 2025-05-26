import React, { Component } from 'react';
import { getMessagesBetweenUsers, sendMessage, getOnlineDoctors } from '../services/userService';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { connect } from 'react-redux';
import { io } from 'socket.io-client';

import './chatbox.scss';

class ChatBox extends Component {
  state = {
    selectedDoctorId: null,
    messages: [],
    newMessage: '',
    doctors: [],
    loading: false,
  };

  socket = null; // 👈 Thêm biến socket

  componentDidMount() {
    this.loadOnlineDoctors();

    // 👉 Khởi tạo kết nối socket
    this.socket = io(process.env.REACT_APP_BACKEND_URL); // Thay bằng URL server của bạn
    const { userInfo } = this.props;

    // Gửi ID người dùng để định danh
    if (userInfo?.id) {
      this.socket.emit('setup', userInfo.id);
    }

    // 👉 Nhận tin nhắn mới từ server
    this.socket.on('receiveMessage', (message) => {
      const { selectedDoctorId } = this.state;
      // Kiểm tra nếu tin nhắn đến từ người đang chat thì mới thêm vào
      if (
        (message.senderId === selectedDoctorId && message.receiverId === userInfo.id) ||
        (message.senderId === userInfo.id && message.receiverId === selectedDoctorId)
      ) {
        this.setState((prev) => ({
          messages: [...prev.messages, message],
        }), this.scrollToBottom);
      }
    });
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect(); 
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedDoctorId !== this.state.selectedDoctorId) {
      this.loadMessages();
    }
  }

  loadOnlineDoctors = async () => {
    try {
      const res = await getOnlineDoctors();
      if (res.errCode === 0) {
        this.setState({ doctors: res.data });
      }
    } catch (e) {
      console.error('Error loading online doctors', e);
    }
  };

  loadMessages = async () => {
    const { userInfo } = this.props;
    const { selectedDoctorId } = this.state;
    if (!userInfo?.id || !selectedDoctorId) return;

    try {
      const res = await getMessagesBetweenUsers(userInfo.id, selectedDoctorId);
      if (res.errCode === 0) {
        this.setState({ messages: res.data }, this.scrollToBottom);
      }
    } catch (e) {
      console.error('Error loading messages', e);
    }
  };

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  };

  handleSend = async () => {
    const { userInfo } = this.props;
    const { selectedDoctorId, newMessage } = this.state;
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      senderId: userInfo.id,
      receiverId: selectedDoctorId,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    this.setState(
      (prev) => ({
        messages: [...prev.messages, optimisticMessage],
        newMessage: '',
      }),
      this.scrollToBottom
    );

    try {
      const res = await sendMessage({
        senderId: userInfo.id,
        receiverId: selectedDoctorId,
        message: newMessage.trim(),
      });

      if (res.data?.errCode === 0) {
        // 👉 Gửi qua socket nếu thành công
        if (this.socket) {
          this.socket.emit('sendMessage', res.data);
        }

        this.setState((prev) => ({
          messages: prev.messages.map((msg) =>
            msg.id === tempId ? res.data : msg
          ),
        }));
      }
    } catch (e) {
      console.error('Send message failed', e);
    }
  };

  render() {
    const { doctors, selectedDoctorId, messages, newMessage, loading } = this.state;
    const { userInfo } = this.props;

    return (
      <div className="chatbox">
        <div className="chatbox__header">💬 Doctor Chat</div>

        <div className="chatbox__doctors">
          {doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => this.setState({ selectedDoctorId: doc.id, messages: [] })}
              className={`chatbox__doctors-button ${doc.id === selectedDoctorId ? 'selected' : ''}`}
              title={doc.firstName}
            >
              <img src={doc.image || 'https://www.w3schools.com/w3images/avatar2.png'} alt="doctor" />
              <span>{doc.firstName}</span>
            </button>
          ))}
        </div>

        <div className="chatbox__messages">
          {messages.length === 0 && (
            <div className="chatbox__messages-empty">No messages yet. Start chatting!</div>
          )}

          {messages.map((msg) => {
            const isSender = msg.senderId === userInfo.id;
            const senderInfo = doctors.find((d) => d.id === msg.senderId);
            return (
              <div
                key={msg.id}
                className={`chatbox__messages-item ${isSender ? 'sender' : 'receiver'}`}
              >
                {!isSender && (
                  <img
                    src={senderInfo?.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                    alt="avatar"
                    title={senderInfo?.firstName || 'Doctor'}
                  />
                )}

                <div
                  className={`chatbox__messages-item-bubble ${isSender ? 'sender' : 'receiver'}`}
                >
                  {msg.message}
                  <div
                    className={`chatbox__messages-item-bubble-time ${
                      isSender ? 'sender' : 'receiver'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={(el) => { this.messagesEnd = el; }} />
        </div>

        <div className="chatbox__input">
          <input
            value={newMessage}
            onChange={(e) => this.setState({ newMessage: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && this.handleSend()}
            placeholder="Type a message..."
            disabled={loading || !selectedDoctorId}
          />
          <button
            onClick={this.handleSend}
            disabled={loading || !selectedDoctorId}
            title="Send"
            aria-label="Send message"
          >
            <PaperPlaneIcon />
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(ChatBox);
