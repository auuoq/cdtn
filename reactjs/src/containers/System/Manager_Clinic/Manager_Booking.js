import React, { Component } from 'react';
import { connect } from "react-redux";
import './Manager_Booking.scss';
import { getDetailClinicByManager, getExamPackagesDetailByManager } from '../../../services/userService';
import ProfileDoctor from '../../Patient/Doctor/ProfileDoctor';
import DoctorSchedule from '../../Patient/Doctor/DoctorSchedule';
import DoctorExtraInfor from '../../Patient/Doctor/DoctorExtraInfor';
import PackageItem from '../../Patient/ExamPackage/PackageItem'; // component gói khám mới

class Manage_Booking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arrDoctorId: [],       // danh sách doctorId của phòng khám
            dataDetailClinic: {},  // thông tin phòng khám
            arrPackages: [],       // danh sách gói khám của phòng khám
            filterType: 'all',     // loại lọc: 'all' | 'doctors' | 'packages'
        };
    }

    async componentDidMount() {
        const { userId } = this.props;

        // Lấy thông tin phòng khám và bác sĩ
        let resClinic = await getDetailClinicByManager({ userId: userId.id });
        if (resClinic && resClinic.errCode === 0) {
            let data = resClinic.data;
            let arrDoctorId = [];
            if (data && data.doctorClinic && data.doctorClinic.length > 0) {
                arrDoctorId = data.doctorClinic.map(item => item.doctorId);
            }

            this.setState({
                dataDetailClinic: data,
                arrDoctorId: arrDoctorId,
            });
        }

        // Lấy gói khám của phòng khám mà user quản lý
        let resPackages = await getExamPackagesDetailByManager(userId.id);
        if (resPackages && resPackages.errCode === 0) {
            this.setState({
                arrPackages: resPackages.data
            });
        }
    }

    // Xử lý thay đổi filter
    handleFilterChange = (event) => {
        this.setState({ filterType: event.target.value });
    }

    render() {
        let { arrDoctorId, dataDetailClinic, arrPackages, filterType } = this.state;

        return (
            <div className="detail-specialty-container">
                <div className="detail-specialty-body">

                    {/* Thông tin phòng khám */}
                    <div className="clinic-info-container">
                        {dataDetailClinic && dataDetailClinic.name && (
                            <>
                                <div className="clinic-info">
                                    {dataDetailClinic.image && (
                                        <div className="clinic-image">
                                            <img
                                                src={dataDetailClinic.image}
                                                alt={dataDetailClinic.name}
                                                style={{ width: "150px", height: "150px", borderRadius: "8px", objectFit: "cover" }}
                                            />
                                        </div>
                                    )}
                                    <div className="clinic-details">
                                        <h1>{dataDetailClinic.name}</h1>
                                        <p>{dataDetailClinic.address}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Filter chọn loại hiển thị */}
                    <div className="filter-container" style={{ marginBottom: '20px' }}>
                        <label htmlFor="filter-select" style={{ marginRight: '10px' }}>Lọc: </label>
                        <select
                            id="filter-select"
                            onChange={this.handleFilterChange}
                            value={filterType}
                        >
                            <option value="all">Tất cả</option>
                            <option value="doctors">Bác sĩ</option>
                            <option value="packages">Gói khám</option>
                        </select>
                    </div>

                    {/* Danh sách bác sĩ (hiển thị nếu filter là all hoặc doctors) */}
                    {(filterType === 'all' || filterType === 'doctors') && arrDoctorId && arrDoctorId.length > 0 && (
                        arrDoctorId.map((doctorId, index) => (
                            <div className="each-doctor" key={index}>
                                <div className="dt-content-left">
                                    <div className="profile-doctor">
                                        <ProfileDoctor
                                            doctorId={doctorId}
                                            isShowDescriptionDoctor={true}
                                            isSHowLinkDetail={true}
                                            isShowPrice={false}
                                        />
                                    </div>
                                </div>
                                <div className="dt-content-right">
                                    <div className="doctor-schedule">
                                        <DoctorSchedule doctorIdFromParent={doctorId} />
                                    </div>
                                    <div className="doctor-extra-infor">
                                        <DoctorExtraInfor doctorIdFromParent={doctorId} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Danh sách gói khám (hiển thị nếu filter là all hoặc packages) */}
                    {(filterType === 'all' || filterType === 'packages') && (
                        <div className="package-list">
                            <h2>Danh sách gói khám</h2>
                            {arrPackages && arrPackages.length > 0 ? (
                                arrPackages.map((item, index) => (
                                    <PackageItem key={index} detailPackage={item} />
                                ))
                            ) : (
                                <p>Không có gói khám nào</p>
                            )}
                        </div>
                    )}

                </div>
            </div>
        );
    }
}

// Lấy dữ liệu từ redux store
const mapStateToProps = state => {
    return {
        language: state.app.language,
        userId: state.user.userInfo,
    };
};

export default connect(mapStateToProps)(Manage_Booking);
