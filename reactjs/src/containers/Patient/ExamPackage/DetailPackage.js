// DetailExamPackage.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailPackage.scss';
import { getDetailExamPackageById } from '../../../services/userService';
import PackageSchedule from './PackageSchedule';
import PackageExtraInfor from './PackageExtraInfor';
import BookingModal from './BookingModal';

class DetailPackage extends Component {
    state = {
        detailPackage: {},
        isOpenModalBooking: false,
        dataScheduleTimeModal: {}
    };

    async componentDidMount() {
        if (this.props.match?.params?.id) {
            const id = this.props.match.params.id;
            let res = await getDetailExamPackageById(id);
            if (res && res.errCode === 0) {
                this.setState({ detailPackage: res.data });
            }
        }
    }

    handleClickScheduleTime = (time) => {
        this.setState({
            isOpenModalBooking: true,
            dataScheduleTimeModal: time
        })
    }

    closeBookingModal = () => {
        this.setState({
            isOpenModalBooking: false
        })
    }

    render() {
        const { detailPackage, isOpenModalBooking, dataScheduleTimeModal } = this.state;
        const {
            name,
            image,
            description,
            contentHTML,
            clinicInfo,
            provinceTypeData,
            categoryTypeData,
            paymentTypeData,
            price,
        } = detailPackage;

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="exam-package-detail-container">
                    {/* Header Section */}
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

                    {/* Main Content */}
                    <div className="package-body">
                        <div className="main-content">
                            {/* Schedule Section */}
                            <div className="schedule-section">
                                <h2 className="section-title">Lịch khám</h2>
                                <PackageSchedule
                                    packageIdFromParent={this.props.match?.params?.id}
                                    handleClickScheduleTime={this.handleClickScheduleTime}
                                />
                            </div>

                            {/* Detail Content */}
                            <div className="content-section">
                                <h2 className="section-title">Chi tiết gói khám</h2>
                                <div className="detail-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />
                            </div>
                        </div>

                        {/* Sidebar */}
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

                <BookingModal
                    isOpenModal={isOpenModalBooking}
                    closeBookingModal={this.closeBookingModal}
                    dataTime={dataScheduleTimeModal}
                    detailPackage={detailPackage}
                />
            </>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(DetailPackage);
