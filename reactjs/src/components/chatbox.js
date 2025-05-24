import React, { Component } from 'react';
import {
  getMessagesBetweenUsers,
  sendMessage,
  getOnlineDoctors,
  getUserConversations,
} from '../services/userService';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { connect } from 'react-redux';

import './chatbox.scss';

class ChatBox extends Component {
  state = {
    selectedDoctorId: null,
    messages: [],
    newMessage: '',
    doctors: [],
    previousConversations: [],
    loading: false,
  };

  componentDidMount() {
    this.loadOnlineDoctors();
    this.loadUserConversations();

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

  loadUserConversations = async () => {
    const { userInfo } = this.props;
    if (!userInfo?.id) return;

    try {
        const res = await getUserConversations(userInfo.id);
        if (res.errCode === 0) {
            this.setState({ previousConversations: res.data });
        }
    } catch (e) {
        console.error('Error loading conversation history', e);
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

    this.setState({ loading: true });
    try {
      const res = await sendMessage({
        senderId: userInfo.id,
        receiverId: selectedDoctorId,
        message: newMessage.trim(),
      });
      if (res.data?.errCode === 0) {
        this.setState(
          (prev) => ({
            messages: [...prev.messages, res.data],
            newMessage: '',
          }),
          this.scrollToBottom
        );
      }
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
        doctors,
        selectedDoctorId,
        messages,
        newMessage,
        loading,
        previousConversations,
    } = this.state;
    const { userInfo } = this.props;

    const combinedDoctors = [
        ...doctors,
        ...previousConversations.filter(
        (conv) => !doctors.some((doc) => doc.id === conv.id)
        ),
    ];

    const selectedDoctor = combinedDoctors.find((d) => d.id === selectedDoctorId);

    return (
        <div className="chatbox">
        {!selectedDoctorId ? (
            <>
            <div className="chatbox__header">💬 Doctor Chat</div>

            {/* Online Doctors */}
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
                    <span>{doc.firstName}</span>
                </button>
                ))}
            </div>

            {/* Conversation History */}
            <div className="chatbox__history">
                <h4>🕑 Previous Conversations</h4>
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
                    <span>{user.firstName}</span>
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
            {/* Chat Header with Doctor Info */}
            <div className="chatbox__header chatbox__chat-header">
                <button
                className="chatbox__back-button"
                onClick={() => this.setState({ selectedDoctorId: null })}
                >
                ⬅ Back
                </button>
                <img
                src={selectedDoctor?.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                alt="avatar"
                />
                <div className="chatbox__doctor-info">
                <strong>{selectedDoctor?.firstName}</strong>
                <span className={selectedDoctor?.isActive ? 'online' : 'offline'}>
                    {selectedDoctor?.isActive ? 'Online' : 'Offline'}
                </span>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="chatbox__messages">
                {messages.length === 0 && (
                <div className="chatbox__messages-empty">No messages yet.</div>
                )}

                {messages.map((msg) => {
                const isSender = msg.senderId === userInfo.id;
                const senderInfo = combinedDoctors.find((d) => d.id === msg.senderId);
                return (
                    <div
                    key={msg.id}
                    className={`chatbox__messages-item ${isSender ? 'sender' : 'receiver'}`}
                    >
                    {!isSender && (
                        <img
                        src={
                            senderInfo?.image || 'https://www.w3schools.com/w3images/avatar2.png'
                        }
                        alt="avatar"
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
                <div ref={(el) => (this.messagesEnd = el)} />
            </div>

            {/* Message Input */}
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
                >
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
