import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import logo from '../../assets/logo1.jpg';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../utils';
import { withRouter } from 'react-router';
import { changeLanguageApp } from "../../store/actions";
import * as actions from "../../store/actions";
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

class HomeHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false, // Trạng thái mở/đóng menu
        };
        this.state = {
            isMenuOpen: false,
            searchKeyword: "",
            searchType: "doctor", // Mặc định là tìm bác sĩ
        };
    }
    

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language);
    }

    returnToHome = () => {
        if (this.props.history) {
            this.props.history.push(`/home`);
        }
    }

    scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.log(`${sectionId} section not found`);
        }
    }

    toggleMenu = () => {
        this.setState({
            isMenuOpen: !this.state.isMenuOpen // Chuyển trạng thái mở/đóng menu
        });
    }

    handleMouseEnter = () => {
        this.setState({
            isMenuOpen: true // Hiển thị menu khi trỏ chuột vào
        });
    }

    handleMouseLeave = () => {
        this.setState({
            isMenuOpen: false // Ẩn menu khi không trỏ chuột vào
        });
    }

    handleMenuClick = (menuItem) => {
        switch (menuItem) {
            case 'profile':
                this.props.history.push('/profile');
                break;
            case 'appointment':
                this.props.history.push('/appointments');
                break;
            case 'logout':
                // Thực hiện chức năng đăng xuất
                this.props.logout();
                break;
            case 'login':
                this.props.history.push('/login');  // Điều hướng đến trang đăng nhập admin
                break;
            case 'user-login':
                this.props.history.push('/user-login');  // Điều hướng đến trang đăng nhập người dùng
                break;
            default:
                break;
        }
    }

    handleSearch = () => {
        const { searchKeyword, searchType } = this.state;

        if (!searchKeyword.trim()) return;

        switch (searchType) {
            case 'doctor':
                this.props.history.push(`/search-doctor?keyword=${encodeURIComponent(searchKeyword.trim())}`);
                break;
            case 'clinic':
                this.props.history.push(`/search-clinic?keyword=${encodeURIComponent(searchKeyword.trim())}`);
                break;
            case 'service':
                this.props.history.push(`/search-service?keyword=${encodeURIComponent(searchKeyword.trim())}`);
                break;
            case 'packet':
                this.props.history.push(`/search-packet?keyword=${encodeURIComponent(searchKeyword.trim())}`);
                break;
            default:
                break;
        }
    }


    render() {
        const { language, isLoggedIn,processLogout } = this.props;
        const { isMenuOpen } = this.state;



        return (
            <React.Fragment>
                <div className="home-header-container">
                    <div className='home-header-content'>
                        <div className="left-content">
                            <i className="fas fa-bars" onClick={this.toggleMenu}></i>
                            <img className="header-logo" src={logo} onClick={() => this.returnToHome()} />
                        </div>
                        <div className="center-content">
                            <div className='child-content' onClick={() => this.scrollToSection('specialty-section')}>
                                <div><b><FormattedMessage id="homeheader.speciality" /> </b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.searchdoctor" /></div>
                            </div>
                            <Link to="/AllPacket"className='child-content' style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}> 
                                <div><b>Gói khám</b></div>
                                <div className='subs-title'>Lựa chọn gói khám</div>
                            </Link>
                            <div className='child-content' onClick={() => this.scrollToSection('doctor-section')}>
                                <div><b><FormattedMessage id="homeheader.doctor" /> </b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.select-doctor" /></div>
                            </div>
                            {/* <div className='child-content' onClick={() => this.scrollToSection('fee-section')}>
                                <div><b><FormattedMessage id="homeheader.fee" /> </b></div>
                                <div className='subs-title'><FormattedMessage id="homeheader.check-health" /></div>
                            </div> */}
                        </div>
                        <div className="right-content">
                            <div className="support">
                                <i className="fas fa-question-circle"></i>
                                <FormattedMessage id="homeheader.support" />
                            </div>
                            <div className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'} onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</div>
                            <div className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'} onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</div>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="dropdown-menu1">
                            {isLoggedIn ? (
                                <>
                                    <div className="menu-item1" onClick={() => this.handleMenuClick('profile')}>Hồ sơ</div>
                                    <div className="menu-item1" onClick={() => this.handleMenuClick('appointment')}>Lịch khám</div>
                                    <div className="menu-item1" onClick={processLogout}>Đăng xuất</div>
                                    
                                </>
                            ) : (
                                <>
                                    {/* <div className="menu-item1" onClick={() => this.handleMenuClick('user-login')}>Đăng nhập</div> */}
                                    <div className="menu-item1" onClick={() => this.handleMenuClick('login')}>Đăng nhập</div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {this.props.isShowBanner && (
                    <div className='home-header-banner'>
                        <div className='content-up'>
                            <div className='title1'><FormattedMessage id="banner.title1" /></div>
                            <div className='title2'><FormattedMessage id="banner.title2" /></div>
                            <div
                            className="search"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#fdd800',
                                borderRadius: '50px',
                                padding: '0 16px',
                                height: '48px',
                                width: 'fit-content',
                                gap: '8px',
                            }}
                            >
                            <i
                                className="fas fa-search"
                                onClick={this.handleSearch}
                                style={{
                                marginRight: '8px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: 'black',
                                lineHeight: '1',
                                }}
                            ></i>

                            <input
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm"
                                value={this.state.searchKeyword}
                                onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && this.handleSearch()}
                                style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '16px',
                                lineHeight: '1',
                                height: '100%',
                                padding: 0,
                                minWidth: '150px',
                                }}
                            />

                            <div
                                className="vertical-line"
                                style={{
                                height: '60%',
                                width: '1px',
                                backgroundColor: 'black',
                                }}
                            />

                            <div
                                className="select-wrapper"
                                style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                }}
                            >
                                <select
                                value={this.state.searchType}
                                onChange={(e) => this.setState({ searchType: e.target.value })}
                                className="search-type-select"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '16px',
                                    height: '100%',
                                    lineHeight: '1',
                                    cursor: 'pointer',
                                    padding: '8px 24px 8px 8px',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    outline :'none'
                                }}
                                >
                                <option value="doctor">Bác sĩ</option>
                                <option value="clinic">Phòng khám</option>
                                <option value="service">Chuyên khoa</option>
                                <option value="packet">Gói khám</option>
                                </select>

                                <i
                                className="fas fa-chevron-down arrow-icon"
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    pointerEvents: 'none',
                                    fontSize: '12px',
                                    color: 'black',
                                }}
                                ></i>
                            </div>
                            </div>




                        </div>
                        <div className='content-down'>
                            <div className='options'>
                                <div className="option-child">
                                    <div className="icon-child"><i className="far fa-hospital"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child1" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-mobile-alt"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child2" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-procedures"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child3" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-flask"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child4" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-user-md"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child5" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-briefcase-medical"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child6" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
        processLogout: () => dispatch(actions.processLogout()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeHeader));
