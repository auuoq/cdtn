import React, { Component } from 'react';
import { connect } from "react-redux";
import './Booking_Clinic.scss';
import { getUserBookingsByManager } from '../../../services/userService';
import { toast } from 'react-toastify';

class Booking_Clinic extends Component {
    state = {
        bookings: [],
        loading: true
    };

    async componentDidMount() {
        const { userId } = this.props;
        const res = await getUserBookingsByManager(userId.id);
        if (res && res.errCode === 0) {
            this.setState({ bookings: res.data, loading: false });
        } else {
            toast.error('Không thể lấy dữ liệu lịch khám!');
            this.setState({ loading: false });
        }
    }

    render() {
        const { bookings, loading } = this.state;

        return (
            <div className="booking-clinic-wrapper">
                <h2 className="booking-title" style={
                    {
                        textAlign:"left"
                    }
                }>Lịch khám của bệnh nhân</h2>

                {loading ? (
                    <div className="loading-text">Đang tải dữ liệu...</div>
                ) : (
                    <div className="booking-list">
                        {bookings.length > 0 ? (
                            bookings.map((booking, index) => {
                                const doctor = booking.doctorData || {};
                                const patient = booking.patientData || {};
                                const timeType = booking.timeTypeDataPatient || {};
                                const status = booking.statusIdDataPatient || {};
                                const time = new Date(parseInt(booking.date)).toLocaleString('vi-VN');

                                return (
                                    <div key={index} className="booking-card">
                                        <div className="booking-card-header">
                                            <div className="person doctor">
                                                <img
                                                    src={doctor.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                                                    alt="Doctor"
                                                    className="avatar"
                                                />
                                                <div className="info">
                                                    <div><strong>Bác sĩ:</strong> {doctor.firstName} {doctor.lastName}</div>
                                                    <div><strong>Email:</strong> {doctor.email}</div>
                                                    <div><strong>Giới tính:</strong> {doctor.genderData?.valueVi}</div>
                                                </div>
                                            </div>
                                            <div className="person patient">
                                                <img
                                                    src={patient.image || 'https://www.w3schools.com/w3images/avatar2.png'}
                                                    alt="Patient"
                                                    className="avatar"
                                                />
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
                            })
                        ) : (
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
