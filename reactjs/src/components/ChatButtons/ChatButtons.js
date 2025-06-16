import React, { useState } from 'react';
import { FaRobot } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import ChatBox from '../chatbox';
import ChatBot from '../ChatBot/ChatBot';
import { useLocation } from 'react-router-dom';

const HIDE_CHAT_ROUTES = [       
    '/doctor/manage',
    '/doctor/chat',
    '/register',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/system',
    '/user-login',
    '/manage/'   
];
const ChatButtons = () => {
    const [showChatbox, setShowChatbox] = useState(false);
    const [showGeminiBot, setShowGeminiBot] = useState(false);

    const { pathname } = useLocation();                
    const isHidden = HIDE_CHAT_ROUTES.some(r => pathname.startsWith(r));
    if (isHidden) return null;  
    const toggleChatbox = () => {
        setShowChatbox(!showChatbox);
    };

    const toggleGeminiBot = () => {
        setShowGeminiBot(!showGeminiBot);
    };
        const floatingButtonStyle = {
        position: 'fixed',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1001,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.25s ease-in-out',
    };

    const panelStyle = {
        position: 'fixed',
        bottom: '100px',
        zIndex: 1000,
        width: '360px',
        maxHeight: '500px',
        background: '#fff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        borderRadius: '10px',
        overflow: 'hidden',
        animation: 'fadeInUp 0.3s ease',
        transition: 'all 0.25s ease-in-out'
    };


    return (
        <>
            <div
                onClick={toggleChatbox}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '15px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #36d1dc, #5b86e5)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 1001,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    fontSize: '26px',
                    transition: 'transform 0.2s ease',
                }}
                title="Nhắn tin với bác sĩ"
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <BsChatDotsFill />
            </div>

            {/* Gemini AI button */}
            <div
                onClick={toggleGeminiBot}
                style={{
                    ...floatingButtonStyle,
                    bottom: '80px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                    color: 'white',
                    fontSize: '28px',
                }}
                title="Trò chuyện với AI Gemini"
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <FaRobot />
            </div>

            {/* Gemini panel */}
            {showGeminiBot && (
                <div style={{ ...panelStyle, right: '20px',bottom:'160px' }}>
                    <ChatBot />
                </div>
            )}
{/* 
            {showGeminiBot && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '80px',
                        zIndex: 1000,
                        width: '350px',
                        maxHeight: '500px',
                        background: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    <ChatBot />
                </div>
            )} */}

            {showChatbox && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '20px',
                        zIndex: 1003,
                        width: '320px',
                        maxHeight: '500px',
                        background: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                >
                    <ChatBox />
                </div>
            )}
        </>
    );
};

export default ChatButtons; 