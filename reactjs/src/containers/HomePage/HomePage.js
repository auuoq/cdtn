import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from './HomeHeader';
import Specialty from './Section/Specialty';
import MedicalFacility from './Section/MedicalFacility';
import OutStandingDoctor from './Section/OutStandingDoctor';
import HandBook from './Section/HandBook';
import About from './Section/About';
import HomeFooter from './HomeFooter';
import ChatBox from '../../components/chatbox';
import ChatBot from '../../components/ChatBot/ChatBot'

import './HomePage.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

class HomePage extends Component {
    state = {
        showChatbox: false,
    };

    toggleChatbox = () => {
        this.setState((prev) => ({ showChatbox: !prev.showChatbox }));
    };
    state = {
        showChatbox: false,
        showGeminiBot: false, 
    };

    toggleGeminiBot = () => {
        this.setState((prev) => ({ showGeminiBot: !prev.showGeminiBot }));
    };

    render() {
        let settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
        };

        return (
            <div>
                <HomeHeader isShowBanner={true} />
                <div id="specialty-section">
                    <Specialty settings={settings} />
                </div>
                <div id="health-facility-section">
                    <MedicalFacility settings={settings} />
                </div>
                <div id="doctor-section">
                    <OutStandingDoctor settings={settings} />
                </div>
                <HandBook settings={settings} />
                <About />
                <HomeFooter />

                <div
                    onClick={this.toggleChatbox}
                    style={{
                        position: 'fixed',
                        bottom: '10px',
                        right: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 1001,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        fontSize: '24px',
                    }}
                    title="Nhắn tin với bác sĩ"
                >
                    💬
                </div>
                <div
                    onClick={this.toggleGeminiBot}
                    style={{
                        position: 'fixed',
                        bottom: '70px',
                        right: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#28a745',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 1001,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        fontSize: '24px',
                    }}
                    title="Trò chuyện với AI Gemini"
                    >
                    🤖
                </div>

                {this.state.showGeminiBot && (
                <div
                    style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '80px', // đẩy sang trái chút nếu cần tránh đè lên nhau
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
                )}

                {this.state.showChatbox && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '20px',
                            zIndex: 1000,
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
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

export default connect(mapStateToProps)(HomePage);
