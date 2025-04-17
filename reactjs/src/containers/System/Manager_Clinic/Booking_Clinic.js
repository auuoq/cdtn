import React, { Component } from 'react';
import { connect } from "react-redux";
import './Booking_Clinic.scss';
import { getUserBookingsByManager } from '../../../services/userService'; // API đã cập nhật để lấy bệnh nhân với trạng thái S3
import { toast } from 'react-toastify';

class Booking_Clinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bookings: [],
            loading: true
        };
    }

    async componentDidMount() {
        const { userId } = this.props; // Lấy userId từ redux
        let res = await getUserBookingsByManager(userId.id);

        if (res && res.errCode === 0) {
            this.setState({
                bookings: res.data,
                loading: false
            });
        } else {
            toast.error('Failed to fetch bookings!');
            this.setState({ loading: false });
        }
    }

    render() {
        const { bookings, loading } = this.state;
    
        return (
            <div className="manage-bookings-container">
                <div className="m-b-title">
                    Lịch khám của bệnh nhân
                </div>
    
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="bookings-list">
                        {bookings.length > 0 ? (
                            bookings.map((booking, index) => {
                                const doctor = booking.doctorData;
                                const patient = booking.patientData;
                                const timeType = booking.timeTypeDataPatient;
                                const status = booking.statusIdDataPatient;
                                const time = new Date(parseInt(booking.date)).toLocaleString();
    
                                const doctorImage = doctor && doctor.image ? doctor.image : "https://www.w3schools.com/w3images/avatar2.png"; // Avatar trắng mặc định
                                const patientImage = patient && patient.image ? patient.image : "https://www.w3schools.com/w3images/avatar2.png"; // Avatar trắng mặc định
                                
                                return (
                                    <div key={index} className="booking-item">
                                        <div className="booking-header">
                                            <div className="doctor-info">
                                                <img src={doctorImage} alt="Doctor" className="avatar" />
                                                <div>
                                                    <div><strong>Bác sĩ:</strong> {doctor.firstName} {doctor.lastName}</div>
                                                    <div><strong>Email:</strong> {doctor.email}</div>
                                                    <div><strong>Giới tính:</strong> {doctor.genderData.valueVi}</div>
                                                </div>
                                            </div>
                                            <div className="patient-info">
                                                <img src={patientImage} alt="Patient" className="avatar" />
                                                <div>
                                                    <div><strong>Bệnh nhân:</strong> {patient && patient.firstName} {patient && patient.lastName ? patient.lastName : ''}</div>
                                                    <div><strong>Email:</strong> {patient && patient.email}</div>
                                                    <div><strong>Giới tính:</strong> {patient && patient.genderData ? patient.genderData.valueVi : ''}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="booking-body">
                                            <div><strong>Thời gian:</strong> {timeType.valueVi} ({time})</div>
                                            <div><strong>Trạng thái:</strong> {status.valueVi}</div>
                                            <div><strong>Lý do:</strong> {booking.reason || "Chưa có lý do"}</div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div>No bookings found!</div>
                        )}
                    </div>
                )}
            </div>
        );
    }
    
}

const mapStateToProps = (state) => {
    return {
        userId: state.user.userInfo, // Get userId from redux
    };
};



export default connect(mapStateToProps)(Booking_Clinic);
