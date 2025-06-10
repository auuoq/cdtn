import React, { Component } from 'react';
import './chatbox.scss';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import {
  getMessagesBetweenUsers,
  sendMessage,
  getOnlineDoctors,
  getUserConversations,
} from '../services/userService';
import { connect } from 'react-redux';
import { io } from 'socket.io-client';

class ChatBox extends Component {
  state = {
    selectedDoctorId: null,
    doctors: [],
    previousConversations: [],
    messages: [],
    newMessage: '',
    loading: false,
  };

  socket = null;
  messagesEnd = null;

  componentDidMount() {
    const { userInfo } = this.props;
    this.loadOnlineDoctors();
    this.loadUserConversations();

    // Khởi tạo socket
    this.socket = io(process.env.REACT_APP_BACKEND_URL);
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    // Join room
    this.socket.emit('join', userInfo.id);

    // Lắng nghe event newMessage
    this.socket.on('newMessage', (message) => {
      // Popup notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          `Tin nhắn mới từ ${message.senderId === userInfo.id ? 'Bạn' : 'Bác sĩ'}`,
          { body: message.message }
        );
      }

      // Cập nhật UI nếu đúng cuộc hội thoại đang mở
      const { selectedDoctorId } = this.state;
      const isRelevant =
        (message.senderId === selectedDoctorId && message.receiverId === userInfo.id) ||
        (message.senderId === userInfo.id && message.receiverId === selectedDoctorId);
      if (isRelevant) {
        this.setState(
          (prev) => ({ messages: [...prev.messages, message] }),
          this.scrollToBottom
        );
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedDoctorId !== this.state.selectedDoctorId) {
      this.loadMessages();
    }
  }

  componentWillUnmount() {
    if (this.socket) this.socket.disconnect();
  }

  loadOnlineDoctors = async () => {
    const res = await getOnlineDoctors();
    if (res.errCode === 0) this.setState({ doctors: res.data });
  };

  loadUserConversations = async () => {
    const { id } = this.props.userInfo;
    const res = await getUserConversations(id);
    if (res.errCode === 0) this.setState({ previousConversations: res.data });
  };

  loadMessages = async () => {
    const { id } = this.props.userInfo;
    const { selectedDoctorId } = this.state;
    if (!selectedDoctorId) return;
    const res = await getMessagesBetweenUsers(id, selectedDoctorId);
    if (res.errCode === 0) {
      this.setState({ messages: res.data }, this.scrollToBottom);
    }
  };

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  };

  handleSend = async () => {
    const { userInfo } = this.props;
    const { selectedDoctorId, newMessage, messages } = this.state;
    if (!newMessage.trim()) return;

    // Optimistic UI
    const temp = {
      id: Date.now(),
      senderId: userInfo.id,
      receiverId: selectedDoctorId,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    this.setState(
      { messages: [...messages, temp], newMessage: '' },
      this.scrollToBottom
    );

    // Gửi server
    const res = await sendMessage({
      senderId: userInfo.id,
      receiverId: selectedDoctorId,
      message: newMessage.trim(),
    });
    if (res.errCode === 0) {
      this.socket.emit('sendMessage', res.data);
    }
  };

  render() {
    const {
      doctors,
      previousConversations,
      selectedDoctorId,
      messages,
      newMessage,
    } = this.state;
    const { userInfo } = this.props;

    const combined = [
      ...doctors,
      ...previousConversations.filter((c) => !doctors.find((d) => d.id === c.id)),
    ];
    const selected = combined.find((d) => d.id === selectedDoctorId);

    return (
      <div className="chatbox">
        {!selectedDoctorId ? (
          <>
            <div className="chatbox__header">💬 Nhắn tin với bác sĩ</div>
            <div className="chatbox__doctors">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() =>
                    this.setState({ selectedDoctorId: doc.id, messages: [] })
                  }
                  className="chatbox__doctors-button"
                >
                  <img
                    src={doc.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                    alt="doctor"
                  />
                  <span>{`${doc.firstName} ${doc.lastName}`}</span>
                </button>
              ))}
            </div>
            <div className="chatbox__history">
              {previousConversations.map((user) => (
                <button
                  key={user.id}
                  onClick={() =>
                    this.setState({ selectedDoctorId: user.id }, this.loadMessages)
                  }
                  className="chatbox__doctors-button"
                >
                  <img
                    src={user.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                    alt="doctor"
                  />
                  <div className="chatbox__history-content">
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                    <small className="chatbox__history-preview">
                      {user.lastMessage?.slice(0, 30)}...
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="chatbox__header chatbox__chat-header">
              <button
                className="chatbox__back-button"
                onClick={() => this.setState({ selectedDoctorId: null })}
              >
                ⬅
              </button>
              <img
                src={selected?.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                alt="avatar"
              />
              <div className="chatbox__doctor-info">
                <strong>{`${selected?.firstName} ${selected?.lastName}`}</strong>
                <span className={selected?.isActive ? 'online' : 'offline'}>
                  {selected?.isActive ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="chatbox__messages">
              {messages.length === 0 && (
                <div className="chatbox__messages-empty">Chưa có tin nhắn nào</div>
              )}
              {messages.map((msg) => {
                const isSender = msg.senderId === userInfo.id;
                const sender = combined.find((d) => d.id === msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className={`chatbox__messages-item ${
                      isSender ? 'sender' : 'receiver'
                    }`}
                  >
                    {!isSender && (
                      <img
                        src={
                          sender?.image ||
                          'https://www.w3schools.com/w3images/avatar2.png'
                        }
                        alt="avatar"
                      />
                    )}
                    <div
                      className={`chatbox__messages-item-bubble ${
                        isSender ? 'sender' : 'receiver'
                      }`}
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
              <div ref={(el) => (this.messagesEnd = el)} />
            </div>
            <div className="chatbox__input">
              <input
                value={newMessage}
                onChange={(e) => this.setState({ newMessage: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && this.handleSend()}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={this.handleSend}>
                <PaperPlaneIcon />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(ChatBox);