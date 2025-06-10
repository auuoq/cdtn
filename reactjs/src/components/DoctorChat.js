import React, { Component } from 'react';
import './DoctorChat.scss';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import {
  getMessagesBetweenUsers,
  sendMessage,
  getUserConversations,
  toggleOnlineStatus,
} from '../services/userService';
import { connect } from 'react-redux';
import { io } from 'socket.io-client';

class ChatMessenger extends Component {
  state = {
    selectedUserId: null,
    conversations: [],
    messages: [],
    newMessage: '',
    isActive: false,
  };

  socket = null;
  messagesEndRef = React.createRef();

  async componentDidMount() {
    const { userInfo } = this.props;
    // Lấy lịch sử hội thoại
    let res = await getUserConversations(userInfo.id);
    if (res.errCode === 0) this.setState({ conversations: res.data });

    // Lấy trạng thái online lần đầu
    res = await toggleOnlineStatus(userInfo.id);
    if (res.errCode === 0) this.setState({ isActive: res.data.isActive });

    // Khởi tạo socket & request permission
    this.socket = io(process.env.REACT_APP_BACKEND_URL);
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    // Join room bác sĩ
    this.socket.emit('join', userInfo.id);

    // Lắng nghe newMessage
    this.socket.on('newMessage', (message) => {
      // Popup
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          `Tin nhắn mới từ ${message.senderId === userInfo.id ? 'Bạn' : 'Bệnh nhân'}`,
          { body: message.message }
        );
      }
      // Cập nhật UI nếu cùng cuộc chat
      const { selectedUserId } = this.state;
      if (
        (message.senderId === selectedUserId && message.receiverId === userInfo.id) ||
        (message.senderId === userInfo.id && message.receiverId === selectedUserId)
      ) {
        this.setState(
          (prev) => ({ messages: [...prev.messages, message] }),
          this.scrollToBottom
        );
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedUserId !== this.state.selectedUserId) {
      this.loadMessages();
    }
  }

  componentWillUnmount() {
    if (this.socket) this.socket.disconnect();
  }

  loadMessages = async () => {
    const { userInfo } = this.props;
    const { selectedUserId } = this.state;
    if (!selectedUserId) return;
    const res = await getMessagesBetweenUsers(userInfo.id, selectedUserId);
    if (res.errCode === 0) {
      this.setState({ messages: res.data }, this.scrollToBottom);
    }
  };

  scrollToBottom = () => {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  handleSend = async () => {
    const { userInfo } = this.props;
    const { selectedUserId, newMessage, messages } = this.state;
    if (!newMessage.trim()) return;

    // Optimistic UI
    const tempMsg = {
      id: Date.now(),
      senderId: userInfo.id,
      receiverId: selectedUserId,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    this.setState(
      { messages: [...messages, tempMsg], newMessage: '' },
      this.scrollToBottom
    );

    // Gửi lên server
    const res = await sendMessage({
      senderId: userInfo.id,
      receiverId: selectedUserId,
      message: newMessage.trim(),
    });
    if (res.errCode === 0) {
      this.socket.emit('sendMessage', res.data);
    }
  };

  handleToggleOnline = async () => {
    const { userInfo } = this.props;
    const res = await toggleOnlineStatus(userInfo.id);
    if (res.errCode === 0) {
      this.setState({ isActive: res.data.isActive });
    }
  };

  render() {
    const {
      selectedUserId,
      conversations,
      messages,
      newMessage,
      isActive,
    } = this.state;
    const { userInfo } = this.props;
    const selected = conversations.find((c) => c.id === selectedUserId);

    return (
      <div className="messenger-layout">
        <div className="sidebar">
          <div className="sidebar-header">
            💬 Chat với bệnh nhân
            <label className="status-checkbox">
              <input
                type="checkbox"
                checked={isActive}
                onChange={this.handleToggleOnline}
              />
              {isActive ? 'Hoạt động' : 'Offline'}
            </label>
          </div>
          <div className="conversation-list">
            {conversations.map((user) => (
              <div
                key={user.id}
                className={`conversation-item ${
                  user.id === selectedUserId ? 'active' : ''
                }`}
                onClick={() =>
                  this.setState({ selectedUserId: user.id, messages: [] })
                }
              >
                <img
                  src={
                    user.image || 'https://www.w3schools.com/w3images/avatar2.png'
                  }
                  alt="avatar"
                />
                <div>
                  <div className="name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="last-message">
                    {user.lastMessageSenderId === userInfo.id
                      ? `Bạn: ${user.lastMessage}`
                      : user.lastMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-panel">
          {selected ? (
            <>
              <div className="chat-header">
                {selected.firstName} {selected.lastName}
              </div>
              <div className="chat-messages">
                {messages.map((msg) => {
                  const isSender = msg.senderId === userInfo.id;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-message ${
                        isSender ? 'sent' : 'received'
                      }`}
                    >
                      {msg.message}
                      <div className="chat-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
                <div ref={this.messagesEndRef} />
              </div>
              <div className="chat-input">
                <input
                  value={newMessage}
                  onChange={(e) => this.setState({ newMessage: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && this.handleSend()}
                  placeholder="Type a message..."
                />
                <button onClick={this.handleSend}>
                  <PaperPlaneIcon />
                </button>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              Chọn một bệnh nhân để bắt đầu trò chuyện
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(ChatMessenger);