import React, { Component } from 'react';
import { getMessagesBetweenUsers, sendMessage, getOnlineDoctors } from '../services/userService';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { connect } from 'react-redux';

import './chatbox.scss'; 

class ChatBox extends Component {
  state = {
    selectedDoctorId: null,
    messages: [],
    newMessage: '',
    doctors: [],
    loading: false,
  };

  componentDidMount() {
    this.loadOnlineDoctors();
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
    const { doctors, selectedDoctorId, messages, newMessage, loading } = this.state;
    const { userInfo } = this.props;

    return (
      <div className="chatbox">
        {/* Header */}
        <div className="chatbox__header">💬 Doctor Chat</div>

        {/* Doctors Online */}
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

        {/* Chat messages */}
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

          <div
            ref={(el) => {
              this.messagesEnd = el;
            }}
          />
        </div>

        {/* Message input */}
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
