import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import './Appointments.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import { getUserBookings, deleteAppointment } from '../../../services/userService';
import { toast } from 'react-toastify';

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appointments: [],
            loading: true,
            selectedStatus: 'all',
            statuses: []
        };
    }

    async componentDidMount() {
        await this.fetchAppointments();
    }

    fetchAppointments = async () => {
        const { userInfo } = this.props;
        if (userInfo && userInfo.id) {
            try {
                let response = await getUserBookings(userInfo.id);
                if (response && response.errCode === 0) {
                    const statuses = [...new Set(response.data.map(a => a.statusIdDataPatient?.valueVi || 'Chưa xác định'))];
                    this.setState({
                        appointments: response.data,
                        statuses: ['all', ...statuses],
                        loading: false
                    });
                } else {
                    this.setState({ loading: false });
                    toast.error('Lỗi khi tải lịch hẹn');
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
                this.setState({ loading: false });
                toast.error('Đã xảy ra lỗi khi tải dữ liệu');
            }
        }
    }

    handleStatusChange = (status) => {
        this.setState({ selectedStatus: status });
    }

    formatDate = (timestamp) => {
        if (!timestamp || isNaN(timestamp)) return "N/A";
        const date = new Date(parseInt(timestamp, 10));
        return date.toLocaleDateString('vi-VN');
    }

    handleDoctorDetail = (doctorId) => {
        window.open(`/detail-doctor/${doctorId}`, '_blank');
    }

    handleCancel = async (appointmentId) => {
        try {
            const confirm = window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?');
            if (!confirm) return;
            
            const response = await deleteAppointment(appointmentId);
            if (response?.errCode === 0) {
                toast.success('Hủy lịch hẹn thành công');
                await this.fetchAppointments();
            } else {
                toast.error(response?.errMessage || 'Hủy lịch hẹn thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Đã xảy ra lỗi khi hủy lịch hẹn');
        }
    }

    handleDeposit = (appointmentId) => {
        this.props.history.push(`/deposit/${appointmentId}`);
    }

    getFilteredAppointments = () => {
        const { appointments, selectedStatus } = this.state;
        if (selectedStatus === 'all') return appointments;
        return appointments.filter(app => 
            app.statusIdDataPatient?.valueVi === selectedStatus
        );
    }

    renderStatusBadge = (status) => {
        let badgeClass = '';
        switch(status) {
            case 'Lịch hẹn mới':
                badgeClass = 'badge-primary';
                break;
            case 'Đã xác nhận':
                badgeClass = 'badge-success';
                break;
            case 'Đã khám xong':
                badgeClass = 'badge-info';
                break;
            case 'Đã hủy':
                badgeClass = 'badge-danger';
                break;
            default:
                badgeClass = 'badge-secondary';
        }
        return <span className={`badge ${badgeClass}`}>{status}</span>;
    }

    render() {
        const { loading, statuses, selectedStatus } = this.state;
        const filteredAppointments = this.getFilteredAppointments();

        return (
            <>
                <HomeHeader />
                <div className="appointments-page container-fluid py-4">
                    <div className="row">
                        <div className="col-12">
                            <div className="appointments-header mb-4">
                                
                                <div className="status-filter-container mb-4">
                                    <div className="btn-group" role="group">
                                        {statuses.map(status => (
                                            <button
                                                key={status}
                                                type="button"
                                                className={`btn ${selectedStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.handleStatusChange(status)}
                                            >
                                                {status === 'all' ? 'Tất cả' : status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                    <p className="mt-2">Đang tải dữ liệu...</p>
                                </div>
                            ) : filteredAppointments.length === 0 ? (
                                <div className="empty-state text-center py-5">
                                    <div className="empty-icon mb-3">
                                        <i className="fas fa-calendar-alt fa-3x text-muted"></i>
                                    </div>
                                    <h4>Không có lịch hẹn nào</h4>
                                    <p className="text-muted">Bạn chưa có lịch hẹn nào trong mục này</p>
                                </div>
                            ) : (
                                <div className="appointments-list">
                                    {filteredAppointments.map((appointment, index) => (
                                        <div key={index} className="appointment-card card mb-4">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-8">
                                                        <div className="appointment-info">
                                                            <h4 className="card-title">
                                                                {appointment.doctorData?.firstName} {appointment.doctorData?.lastName}
                                                            </h4>
                                                            
                                                            <div className="appointment-meta mb-3">
                                                                <div className="meta-item">
                                                                    <i className="fas fa-calendar-alt mr-2"></i>
                                                                    <span>{this.formatDate(appointment.date)}</span>
                                                                </div>
                                                                <div className="meta-item">
                                                                    <i className="fas fa-clock mr-2"></i>
                                                                    <span>{appointment.timeTypeDataPatient?.valueVi}</span>
                                                                </div>
                                                                <div className="meta-item">
                                                                    <i className="fas fa-user-md mr-2"></i>
                                                                    <span>Bác sĩ</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="status-container mb-3">
                                                                {this.renderStatusBadge(appointment.statusIdDataPatient?.valueVi || 'Chưa xác định')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="col-md-4">
                                                        <div className="appointment-actions">
                                                            <button 
                                                                className="btn btn-outline-info btn-sm mb-2"
                                                                onClick={() => this.handleDoctorDetail(appointment.doctorId)}
                                                            >
                                                                <i className="fas fa-info-circle mr-1"></i>
                                                                Chi tiết bác sĩ
                                                            </button>
                                                            
                                                            {appointment.statusIdDataPatient?.valueVi === 'Lịch hẹn mới' && (
                                                                <>
                                                                    <button 
                                                                        className="btn btn-primary btn-sm mb-2"
                                                                        onClick={() => this.handleDeposit(appointment.id)}
                                                                    >
                                                                        <i className="fas fa-money-bill-wave mr-1"></i>
                                                                        Đặt cọc
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => this.handleCancel(appointment.id)}
                                                                    >
                                                                        <i className="fas fa-times mr-1"></i>
                                                                        Hủy lịch
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {appointment.statusIdDataPatient?.valueVi === 'Đã xác nhận' && (
                                                                <button 
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => this.handleCancel(appointment.id)}
                                                                >
                                                                    <i className="fas fa-times mr-1"></i>
                                                                    Hủy lịch
                                                                </button>
                                                            )}
                                                            
                                                            {appointment.statusIdDataPatient?.valueVi === 'Đã khám xong' && (
                                                                <button 
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => this.handleDoctorDetail(appointment.doctorId)}
                                                                >
                                                                    <i className="fas fa-check mr-1"></i>
                                                                    Đặt lại
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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

export default withRouter(connect(mapStateToProps)(Appointments));