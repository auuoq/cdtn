import React, { Component } from 'react';
import { getMessagesBetweenUsers, sendMessage, getOnlineDoctors } from '../services/userService';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

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
            if (res.data?.errCode === 0) {
                this.setState({ doctors: res.data });
            }
            console.log("Online doctors loaded", res.data);
        } catch (e) {
            console.error("Error loading online doctors", e);
        }
    };

    loadMessages = async () => {
        const { userInfo } = this.props;
        const { selectedDoctorId } = this.state;
        if (!userInfo?.id || !selectedDoctorId) return;

        try {
            const res = await getMessagesBetweenUsers(userInfo.id, selectedDoctorId);
            if (res.data?.errCode === 0) {
                this.setState({ messages: res.data });
            }
        } catch (e) {
            console.error("Error loading messages", e);
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
                this.setState((prev) => ({
                    messages: [...prev.messages, res.data],
                    newMessage: '',
                }));
            }
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { doctors, selectedDoctorId, messages, newMessage, loading } = this.state;
        const { userInfo } = this.props;

        return (
            <div className="fixed bottom-4 right-4 z-50 w-[500px] max-h-[600px] bg-white shadow-lg rounded-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-3 border-b font-semibold bg-gray-100">
                    <span>💬 Doctor Chat</span>
                </div>

                {/* Doctors Online */}
                <div className="flex overflow-x-auto space-x-3 p-3 border-b bg-gray-50">
                    {doctors.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => this.setState({ selectedDoctorId: doc.id })}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                                doc.id === selectedDoctorId ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
                            }`}
                        >
                            <img src={`data:image/jpeg;base64,${doc.image}`} alt="" className="w-6 h-6 rounded-full" />
                            {doc.firstName}
                        </button>
                    ))}
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-white">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 text-sm mt-10">No messages yet. Start chatting!</div>
                    )}
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded-lg text-sm max-w-[70%] ${
                                msg.senderId === userInfo.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100 mr-auto'
                            }`}
                        >
                            {msg.message}
                        </div>
                    ))}
                </div>

                {/* Message input */}
                <div className="flex border-t p-2 gap-2">
                    <input
                        value={newMessage}
                        onChange={(e) => this.setState({ newMessage: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && this.handleSend()}
                        className="flex-1 border rounded-xl px-3 py-1 text-sm"
                        placeholder="Type a message..."
                        disabled={loading || !selectedDoctorId}
                    />
                    <button
                        onClick={this.handleSend}
                        disabled={loading || !selectedDoctorId}
                        className="text-blue-600"
                        title="Send"
                    >
                        <PaperPlaneIcon />
                    </button>
                </div>
            </div>
        );
    }
}

export default ChatBox;
