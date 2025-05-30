// DetailPackage.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailPackage.scss';
import { getDetailExamPackageById } from '../../../services/userService';
import PackageSchedule from './PackageSchedule';
import PackageExtraInfor from './PackageExtraInfor';
import ChatBox from '../../../components/chatbox';

class DetailPackage extends Component {
    state = {
        detailPackage: {},
        showChatbox: false,
    };

    toggleChatbox = () => {
        this.setState(prevState => ({
            showChatbox: !prevState.showChatbox,
        }));
    };

    async componentDidMount() {
        const { match } = this.props;
        if (match?.params?.id) {
            const res = await getDetailExamPackageById(match.params.id);
            if (res && res.errCode === 0) {
                this.setState({ detailPackage: res.data });
            }
        }
    }

    render() {
        const { detailPackage, showChatbox } = this.state;
        const {
            name,
            image,
            description,
            contentHTML,
            clinicInfo,
            paymentTypeData,
            price,
        } = detailPackage;

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="exam-package-detail-container">
                    {/* Header */}
                    <div className="package-header">
                        <div className="header-image" style={{ backgroundImage: `url(${image || ''})` }} />
                        <div className="header-content">
                            <h1 className="package-title">{name}</h1>
                            <p className="package-description">{description}</p>
                            <div className="price-tag">
                                {new Intl.NumberFormat('vi-VN').format(price)} VND
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="package-body">
                        <div className="main-content">
                            <div className="schedule-section">
                                <h2 className="section-title">Lịch khám</h2>
                                <PackageSchedule
                                    packageIdFromParent={this.props.match?.params?.id}
                                    detailPackage={detailPackage}
                                />
                            </div>

                            <div className="content-section">
                                <h2 className="section-title">Chi tiết gói khám</h2>
                                <div className="detail-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />
                            </div>
                        </div>

                        <div className="sidebar">
                            <div className="info-card">
                                <h3 className="card-title">Thông tin cơ bản</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <i className="fas fa-hospital icon"></i>
                                        <div>
                                            <div className="info-label">Phòng khám</div>
                                            <div className="info-value">{clinicInfo?.name}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-map-marker-alt icon"></i>
                                        <div>
                                            <div className="info-label">Địa chỉ</div>
                                            <div className="info-value">{clinicInfo?.address}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-map icon"></i>
                                        <div>
                                            <div className="info-label">Khu vực</div>
                                            <div className="info-value">Miền Bắc</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-credit-card icon"></i>
                                        <div>
                                            <div className="info-label">Thanh toán</div>
                                            <div className="info-value">{paymentTypeData?.valueVi}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút mở chatbox */}
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

                {showChatbox && (
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
            </>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(DetailPackage);
