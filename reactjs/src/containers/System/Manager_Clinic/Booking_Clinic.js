import React, { Component } from 'react';
import { connect } from "react-redux";
import './Booking_Clinic.scss';
import { getUserBookingsByManager, getPackageBookingsByManager } from '../../../services/userService';
import { toast } from 'react-toastify';

class Booking_Clinic extends Component {
    state = {
        doctorBookings: [],
        packageBookings: [],
        loading: true,
        filterType: 'all',    // all | doctor | package
        filterStatus: 'all'   // all | S1 | S2
    };

    async componentDidMount() {
        const { userId } = this.props;

        try {
            const [doctorRes, packageRes] = await Promise.all([
                getUserBookingsByManager(userId.id),
                getPackageBookingsByManager(userId.id)
            ]);

            if (doctorRes.errCode === 0 || packageRes.errCode === 0) {
                this.setState({
                    doctorBookings: doctorRes.data || [],
                    packageBookings: packageRes.data || [],
                    loading: false
                });
            } else {
                toast.error('Không thể lấy dữ liệu lịch khám!');
                this.setState({ loading: false });
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
            this.setState({ loading: false });
        }
    }

    render() {
        const { doctorBookings, packageBookings, loading, filterType, filterStatus } = this.state;

        const filteredDoctorBookings = doctorBookings.filter(b => {
            if (filterStatus !== 'all' && b.statusId !== filterStatus) return false;
            return filterType === 'all' || filterType === 'doctor';
        });

        const filteredPackageBookings = packageBookings.filter(b => {
            if (filterStatus !== 'all' && b.statusId !== filterStatus) return false;
            return filterType === 'all' || filterType === 'package';
        });

        return (
            <div className="booking-clinic-wrapper">
                <h2 className="booking-title">Lịch khám của bệnh nhân</h2>

                <div className="filter-section">
                    <select
                        value={filterType}
                        onChange={(e) => this.setState({ filterType: e.target.value })}
                    >
                        <option value="all">Tất cả</option>
                        <option value="doctor">Lịch theo bác sĩ</option>
                        <option value="package">Lịch theo gói khám</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => this.setState({ filterStatus: e.target.value })}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="S1">Chờ xác nhận (S1)</option>
                        <option value="S2">Đã xác nhận (S2)</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-text">Đang tải dữ liệu...</div>
                ) : (
                    <div className="booking-list">

                        {/* Booking theo bác sĩ */}
                        {filteredDoctorBookings.map((booking, index) => {
                            const doctor = booking.doctorData || {};
                            const patient = booking.patientData || {};
                            const timeType = booking.timeTypeDataPatient || {};
                            const status = booking.statusIdDataPatient || {};
                            const time = new Date(parseInt(booking.date)).toLocaleString('vi-VN');

                            return (
                                <div key={`doctor-${index}`} className="booking-card">
                                    <div className="booking-card-header">
                                        <div className="person doctor">
                                            <img src={doctor.image || '/default.png'} className="avatar" alt="Doctor" />
                                            <div className="info">
                                                <div><strong>Bác sĩ:</strong> {doctor.firstName} {doctor.lastName}</div>
                                                <div><strong>Email:</strong> {doctor.email}</div>
                                                <div><strong>Giới tính:</strong> {doctor.genderData?.valueVi}</div>
                                            </div>
                                        </div>
                                        <div className="person patient">
                                            <img src={patient.image || '/default.png'} className="avatar" alt="Patient" />
                                            <div className="info">
                                                <div><strong>Bệnh nhân:</strong> {patient.firstName} {patient.lastName}</div>
                                                <div><strong>Email:</strong> {patient.email}</div>
                                                <div><strong>Giới tính:</strong> {patient.genderData?.valueVi}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-card-body">
                                        <div><strong>Thời gian:</strong> {timeType.valueVi} - {time}</div>
                                        <div><strong>Trạng thái:</strong> {status.valueVi}</div>
                                        <div><strong>Lý do:</strong> {booking.reason || 'Chưa có lý do'}</div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Booking theo gói khám */}
                        {filteredPackageBookings.map((booking, index) => {
                            const pkg = booking.packageData || {};
                            const clinic = pkg.clinicInfo || {};
                            const patient = booking.patientData || {};
                            const timeType = booking.timeTypeDataPatient || {};
                            const status = booking.statusIdDataPatient || {};
                            const time = new Date(parseInt(booking.date)).toLocaleString('vi-VN');

                            return (
                                <div key={`package-${index}`} className="booking-card">
                                    <div className="booking-card-header">
                                        <div className="person package">
                                            <img src={pkg.image || '/default.png'} className="avatar" alt="Package" />
                                            <div className="info">
                                                <div><strong>Gói khám:</strong> {pkg.name}</div>
                                                <div><strong>Giá:</strong> {parseInt(pkg.price).toLocaleString('vi-VN')}đ</div>
                                                <div><strong>Phòng khám:</strong> {clinic.name} - {clinic.address}</div>
                                            </div>
                                        </div>
                                        <div className="person patient">
                                            <img src={patient.image || '/default.png'} className="avatar" alt="Patient" />
                                            <div className="info">
                                                <div><strong>Bệnh nhân:</strong> {patient.firstName} {patient.lastName}</div>
                                                <div><strong>Email:</strong> {patient.email}</div>
                                                <div><strong>Giới tính:</strong> {patient.genderData?.valueVi}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="booking-card-body">
                                        <div><strong>Thời gian:</strong> {timeType.valueVi} - {time}</div>
                                        <div><strong>Trạng thái:</strong> {status.valueVi}</div>
                                        <div><strong>Lý do:</strong> {booking.reason || 'Chưa có lý do'}</div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredDoctorBookings.length === 0 && filteredPackageBookings.length === 0 && (
                            <div className="no-booking">Không có lịch khám nào.</div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userId: state.user.userInfo
});

export default connect(mapStateToProps)(Booking_Clinic);
