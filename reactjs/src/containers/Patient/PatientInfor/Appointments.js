import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import './Appointments.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import {
  getUserBookings,
  getUserPackageBookings,
  deleteAppointment,
  deletePackageAppointment
} from '../../../services/userService';
import { toast } from 'react-toastify';

class Appointments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: [],
      loading: true,
      selectedStatus: 'all',
      statuses: [],
      typeFilter: 'all' // 'all', 'doctor', 'package'
    };
  }

  async componentDidMount() {
    await this.fetchAppointments();
  }

  fetchAppointments = async () => {
    const { userInfo } = this.props;
    if (userInfo && userInfo.id) {
      try {
        const [res1, res2] = await Promise.all([
          getUserBookings(userInfo.id),
          getUserPackageBookings(userInfo.id)
        ]);

        const appointments = [
          ...(res1?.data?.map(item => ({ ...item, type: 'doctor' })) || []),
          ...(res2?.data?.map(item => ({ ...item, type: 'package' })) || [])
        ];

        const statuses = [...new Set(appointments.map(a => a.statusIdDataPatient?.valueVi || 'Chưa xác định'))];
        this.setState({
          appointments,
          statuses: ['all', ...statuses],
          loading: false
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu');
        this.setState({ loading: false });
      }
    }
  }

  handleStatusChange = (status) => {
    this.setState({ selectedStatus: status });
  }

  handleTypeFilterChange = (type) => {
    this.setState({ typeFilter: type });
  }

  formatDate = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return "N/A";
    const date = new Date(parseInt(timestamp, 10));
    return date.toLocaleDateString('vi-VN');
  }

  handleDetail = (appointment) => {
    if (appointment.type === 'doctor') {
      window.open(`/detail-doctor/${appointment.doctorId}`, '_blank');
    } else {
      window.open(`/detail-exam-package/${appointment.packageId}`, '_blank');
    }
  }

  handleCancel = async (appointment) => {
    try {
      const confirm = window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?');
      if (!confirm) return;

      let response = {};
      if (appointment.type === 'package') {
        response = await deletePackageAppointment(appointment.id);
      } else {
        response = await deleteAppointment(appointment.id);
      }

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
    const { appointments, selectedStatus, typeFilter } = this.state;
    return appointments.filter(app => {
      const matchStatus = selectedStatus === 'all' || app.statusIdDataPatient?.valueVi === selectedStatus;
      const matchType = typeFilter === 'all' || app.type === typeFilter;
      return matchStatus && matchType;
    });
  }

  renderStatusBadge = (status) => {
    let badgeClass = '';
    switch (status) {
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
    const { loading, statuses, selectedStatus, typeFilter } = this.state;
    const filteredAppointments = this.getFilteredAppointments();

    return (
      <>
        <HomeHeader />
        <div className="appointments-page container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="appointments-header mb-4 d-flex justify-content-between align-items-center">
                <div className="btn-group">
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

                <div className="btn-group">
                  <button
                    className={`btn ${typeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => this.handleTypeFilterChange('all')}
                  >Tất cả</button>
                  <button
                    className={`btn ${typeFilter === 'doctor' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => this.handleTypeFilterChange('doctor')}
                  >Bác sĩ</button>
                  <button
                    className={`btn ${typeFilter === 'package' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => this.handleTypeFilterChange('package')}
                  >Gói khám</button>
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
                                {appointment.type === 'doctor'
                                  ? `${appointment.doctorData.firstName} ${appointment.doctorData.lastName}`
                                  : appointment.packageData?.name || 'Gói khám'}
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
                                  <span>{appointment.type === 'doctor' ? 'Bác sĩ' : 'Gói khám'}</span>
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
                                onClick={() => this.handleDetail(appointment)}
                              >
                                <i className="fas fa-info-circle mr-1"></i>
                                Chi tiết {appointment.type === 'doctor' ? 'bác sĩ' : 'gói khám'}
                              </button>

                              {['Lịch hẹn mới', 'Đã xác nhận'].includes(appointment.statusIdDataPatient?.valueVi) && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => this.handleCancel(appointment)}
                                >
                                  <i className="fas fa-times mr-1"></i>
                                  Hủy lịch
                                </button>
                              )}

                              {appointment.statusIdDataPatient?.valueVi === 'Lịch hẹn mới' && (
                                <button
                                  className="btn btn-primary btn-sm mb-2"
                                  onClick={() => this.handleDeposit(appointment.id)}
                                >
                                  <i className="fas fa-money-bill-wave mr-1"></i>
                                  Đặt cọc
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
