import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Appointments.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import { getUserBookings, deleteAppointment } from '../../../services/userService';

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appointments: [],
            filteredAppointments: [],
            loading: true,
            selectedStatus: null,
            groupedAppointments: {}
        };
    }

    async componentDidMount() {
        const { userInfo } = this.props;

        if (userInfo && userInfo.id) {
            try {
                let response = await getUserBookings(userInfo.id);
                if (response && response.errCode === 0) {
                    const appointments = response.data;
                    const groupedAppointments = this.groupAppointmentsByStatus(appointments);
                    this.setState({
                        appointments,
                        filteredAppointments: appointments,
                        groupedAppointments,
                        loading: false
                    });
                } else {
                    this.setState({ loading: false });
                }
            } catch (error) {
                console.log('Error fetching appointments:', error);
                this.setState({ loading: false });
            }
        }
    }

    groupAppointmentsByStatus(appointments) {
        return appointments.reduce((acc, appointment) => {
            const status = appointment.statusIdDataPatient?.valueVi || 'Chưa xác định';
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(appointment);
            return acc;
        }, {});
    }


    handleStatusChange(status) {
        this.setState(prevState => {
            const filteredAppointments = status === null
                ? prevState.appointments
                : prevState.groupedAppointments[status] || [];
                
            return {
                selectedStatus: status,
                filteredAppointments
            };
        });
    }

    formatDate(timestamp) {
        if (isNaN(timestamp) || timestamp <= 0) {
            return "Ngày không hợp lệ";
        }
        const date = new Date(parseInt(timestamp, 10));
        if (isNaN(date.getTime())) {
            return "Ngày không hợp lệ";
        }
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    handleDoctorDetailClick(doctorId) {
        window.open(`http://localhost:3002/detail-doctor/${doctorId}`, '_blank');
    }

    async handleCancel(appointmentId) {
        try {
            const response = await deleteAppointment(appointmentId);
            
            // Kiểm tra phản hồi và reload trang nếu xóa thành công
            if (response?.errCode === 0) {
                console.error('Error canceling appointment:', response?.errMessage || 'Unknown error');
            } else {
                
                window.location.reload(); // Reload trang để cập nhật danh sách lịch hẹn
            }
        } catch (error) {
            console.error('Error calling delete API:', error.message || 'Unknown error');
        }
    }
    handleDeposit = (appointmentId) => {
        this.props.history.push(`/deposit/${appointmentId}`);
    };
    
    
    
    

    
    
    

    render() {
        const { filteredAppointments, loading, selectedStatus } = this.state;

        if (loading) {
            return <p>Loading...</p>;
        }

        if (filteredAppointments.length === 0) {
            return <p>Không tìm thấy lịch khám nào.</p>;
        }

        const statuses = [...new Set(this.state.appointments.map(a => a.statusIdDataPatient?.valueVi || 'Chưa xác định'))];

        return (
            <>
                <HomeHeader />
                <div className="appointments-container">
                    <h1>Lịch Khám Bệnh</h1>

                    <div className="status-filters">
                        <button
                            className={`status-filter ${selectedStatus === null ? 'active' : ''}`}
                            onClick={() => this.handleStatusChange(null)}
                        >
                            Tất cả
                        </button>
                        {statuses.map(status => (
                            <button
                                key={status}
                                className={`status-filter ${selectedStatus === status ? 'active' : ''}`}
                                onClick={() => this.handleStatusChange(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {Object.entries(this.state.groupedAppointments).map(([status, appointments]) => (
                        (selectedStatus === null || selectedStatus === status) && (
                            <div key={status} className="appointment-group">
                                <h2>{status}</h2>
                                <ul>
                                    {appointments.map((appointment, index) => (
                                        <li key={index}>
                                            <p><strong>Ngày: </strong>{this.formatDate(appointment.date)}</p>
                                            <p><strong>Giờ: </strong>{appointment.timeTypeDataPatient?.valueVi}</p>
                                            <p><strong>Bác sĩ: </strong>
                                                {appointment.doctorData?.firstName} {appointment.doctorData?.lastName}
                                                <button 
                                                    className="detail-button"
                                                    onClick={() => this.handleDoctorDetailClick(appointment.doctorId)}
                                                >
                                                    Chi tiết
                                                </button>
                                            </p>
                                            <p><strong>Trạng thái: </strong>{appointment.statusIdDataPatient?.valueVi}</p>

                                            {status === 'Lịch hẹn mới' && (
                                                <div className="appointment-actions">
                                                    <button 
                                                        className="deposit-button"
                                                        onClick={() => this.handleDeposit(appointment.id)}
                                                    >
                                                        Đặt cọc
                                                    </button>
                                                    <button 
                                                        className="cancel-button"
                                                        onClick={() => this.handleCancel(appointment.id)}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}

                                            {status === 'Đã xác nhận' && (
                                                <div className="appointment-actions">
                                                    <button 
                                                        className="cancel-button"
                                                        onClick={() => this.handleCancel(appointment.id)}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}

                                            {status === 'Đã khám xong' && (
                                                <div className="appointment-actions">
                                                    <button 
                                                        className="reschedule-button"
                                                        onClick={() => this.handleDoctorDetailClick(appointment.doctorId)}
                                                    >
                                                        Đặt lại
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}

                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.user.userInfo
    };
};

export default connect(mapStateToProps)(Appointments);
