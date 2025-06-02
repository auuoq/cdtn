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

class ChatMessenger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUserId: null,
      conversations: [],
      messages: [],
      newMessage: '',
      isActive: false,
    };
    this.messagesEndRef = React.createRef();
    this.messageInterval = null;
  }

  componentDidMount() {
    this.fetchConversations();
    this.fetchDoctorStatus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedUserId !== this.state.selectedUserId) {
      this.loadMessages();

    
      if (this.messageInterval) {
        clearInterval(this.messageInterval);
      }

      if (this.state.selectedUserId) {
        this.messageInterval = setInterval(this.loadMessages, 1000);
      }
    }
  }

  componentWillUnmount() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }

  fetchConversations = async () => {
    const res = await getUserConversations(this.props.userInfo.id);
    if (res.errCode === 0) {
      this.setState({ conversations: res.data });
    }
  };

  fetchDoctorStatus = async () => {
    const res = await toggleOnlineStatus(this.props.userInfo.id);
    if (res.errCode === 0) {
      this.setState({ isActive: res.data.isActive });
    }
  };

  handleToggleOnline = async () => {
    const res = await toggleOnlineStatus(this.props.userInfo.id);
    if (res.errCode === 0) {
      this.setState({ isActive: res.data.isActive });
    }
  };

  loadMessages = async () => {
    const { selectedUserId } = this.state;
    if (!selectedUserId) return;

    const res = await getMessagesBetweenUsers(this.props.userInfo.id, selectedUserId);
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
    const { newMessage, selectedUserId, messages } = this.state;
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      senderId: this.props.userInfo.id,
      receiverId: selectedUserId,
      message: newMessage,
      createdAt: new Date().toISOString(),
    };

    this.setState(
      {
        messages: [...messages, optimisticMessage],
        newMessage: '',
      },
      this.scrollToBottom
    );

    const res = await sendMessage({
      senderId: this.props.userInfo.id,
      receiverId: selectedUserId,
      message: newMessage,
    });

    if (res.errCode === 0) {
      this.setState((prevState) => ({
        messages: prevState.messages.map((msg) =>
          msg.id === tempId ? res.data.data : msg
        ),
      }));
    }
  };

  render() {
    const { selectedUserId, conversations, messages, newMessage, isActive } = this.state;
    const { userInfo } = this.props;

    const selectedUser = conversations.find((c) => c.id === selectedUserId);

    return (
      <div className="messenger-layout">
        <div className="sidebar">
          <div className="sidebar-header">
            💬 Chat với bệnh nhân
            <label  class="status-checkbox" style={{
              marginBottom :0
            }}>
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
                className={`conversation-item ${user.id === selectedUserId ? 'active' : ''}`}
                onClick={() => this.setState({ selectedUserId: user.id, messages: [] })}
              >
                <img
                  src={user.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                  alt="avatar"
                />
                <div>
                  <div className="name">{user.firstName} {user.lastName}</div>
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
          {selectedUser && (
            <div className="chat-header">
              {selectedUser.firstName} {selectedUser.lastName}
            </div>
          )}

          <div className="chat-messages">
            {messages
              .filter(msg => msg)
              .map((msg) => {
                const isSender = msg.senderId === userInfo.id;
                return (
                  <div
                    key={msg.id}
                    className={`chat-message ${isSender ? 'sent' : 'received'}`}
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
              disabled={!selectedUserId}
            />
            <button onClick={this.handleSend} disabled={!selectedUserId}>
              <PaperPlaneIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(ChatMessenger);