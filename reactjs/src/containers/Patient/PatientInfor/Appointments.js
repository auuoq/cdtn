import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import './Appointments.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import {
  getUserBookings,
  getUserPackageBookings,
  deleteAppointment,
  deletePackageAppointment,
  submitFeedback,
  submitFeedbackPackage
} from '../../../services/userService';
import { toast } from 'react-toastify';
import ChatBox from '../../../components/chatbox';

class Appointments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appointments: [],
      loading: true,
      selectedStatus: 'all',
      statuses: [],
      typeFilter: 'all',
      showRatingModal: false,
      selectedAppointment: null,
      commentText: ''
    };
  }
    state = {
    detailDoctor: {},
    currentDoctorId: -1,
    address: '',
    loadingMap: true,
    showChatbox: false, // <-- thêm dòng này
  };

  toggleChatbox = () => {
    this.setState((prevState) => ({
      showChatbox: !prevState.showChatbox,
    }));
  };


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

  handleOpenRatingModal = (appointment) => {
    this.setState({
      showRatingModal: true,
      selectedAppointment: appointment,
      ratingValue: 5,
      commentText: ''
    });
  }

  handleCloseRatingModal = () => {
    this.setState({
      showRatingModal: false,
      selectedAppointment: null
    });
  }

  handleRatingSubmit = async () => {
    const { selectedAppointment, commentText } = this.state;
    try {
      let response;
      if (selectedAppointment.type === 'doctor') {
        response = await submitFeedback({
          appointmentId: selectedAppointment.id,
          feedback: commentText
        });
      } else if (selectedAppointment.type === 'package') {
        response = await submitFeedbackPackage({
          appointmentId: selectedAppointment.id,
          feedback: commentText
        });
      }

      if (response?.errCode === 0) {
        toast.success('Đánh giá thành công');
        this.setState({ showRatingModal: false });
        await this.fetchAppointments();
      } else {
        toast.error(response?.errMessage || 'Gửi đánh giá thất bại');
      }
    } catch (err) {
      console.error('Rating error:', err);
      toast.error('Lỗi khi gửi đánh giá');
    }
  };


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

  renderRatingModal = () => {
    const { showRatingModal, commentText } = this.state;
    if (!showRatingModal) return null;

    return (
      <div className="rating-modal">
        <div className="rating-content">
          <h5>Đánh giá cuộc hẹn</h5>
          <label>Nhận xét:</label>
          <textarea
            value={commentText}
            onChange={e => this.setState({ commentText: e.target.value })}
            className="form-control mb-3"
            rows="4"
          />
          <button className="btn btn-primary mr-2" onClick={this.handleRatingSubmit}>Gửi đánh giá</button>
          <button className="btn btn-secondary" onClick={this.handleCloseRatingModal}>Hủy</button>
        </div>
      </div>
    );
  }

  render() {
    const { loading, statuses, selectedStatus, typeFilter } = this.state;
    const filteredAppointments = this.getFilteredAppointments();

    return (
      <>
        <HomeHeader />
        {this.renderRatingModal()}
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
                  <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                  <h4>Không có lịch hẹn nào</h4>
                  <p className="text-muted">Bạn chưa có lịch hẹn nào trong mục này</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {filteredAppointments.map((appointment, index) => (
                    <div key={index} className="appointment-card card mb-4">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-8 d-flex">
                            <img
                              src={
                                appointment.type === 'doctor'
                                  ? appointment.doctorData?.image
                                  : appointment.packageData?.image
                              }
                              alt="Ảnh"
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }}
                            />

                            <div className="appointment-info">
                              <h4 className="card-title">
                                {appointment.type === 'doctor'
                                  ? `${appointment.doctorData.firstName} ${appointment.doctorData.lastName}`
                                  : appointment.packageData?.name || 'Gói khám'}
                              </h4>

                              {/* Chuyên khoa (nếu có) */}
                              {appointment.type === 'doctor' && appointment.doctorBooking.specialtyData?.name && (
                                <p className="mb-1 text-muted"><i className="fas fa-stethoscope mr-1"></i>Chuyên khoa: {appointment.doctorBooking.specialtyData.name}</p>
                              )}

                              {/* Địa chỉ phòng khám */}
                              <p className="mb-1 text-muted">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {appointment.type === 'doctor'
                                  ? appointment.doctorBooking.clinicData?.address
                                  : appointment.packageData.clinicInfo?.address}
                              </p>

                              {/* Thông tin thời gian */}
                              <div className="appointment-meta mb-2">
                                <div className="meta-item"><i className="fas fa-calendar-alt mr-2"></i>{this.formatDate(appointment.date)}</div>
                                <div className="meta-item"><i className="fas fa-clock mr-2"></i>{appointment.timeTypeDataPatient?.valueVi}</div>
                              </div>

                              <div className="status-container mb-2">
                                {this.renderStatusBadge(appointment.statusIdDataPatient?.valueVi || 'Chưa xác định')}
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="appointment-actions">
                              <button className="btn btn-outline-info btn-sm mb-2" onClick={() => this.handleDetail(appointment)}>
                                <i className="fas fa-info-circle mr-1"></i>
                                Chi tiết {appointment.type === 'doctor' ? 'bác sĩ' : 'gói khám'}
                              </button>

                              {['Lịch hẹn mới', 'Đã xác nhận'].includes(appointment.statusIdDataPatient?.valueVi) && (
                                <button className="btn btn-danger btn-sm mb-2" onClick={() => this.handleCancel(appointment)}>
                                  <i className="fas fa-times mr-1"></i>Hủy lịch
                                </button>
                              )}

                              {appointment.statusIdDataPatient?.valueVi === 'Lịch hẹn mới' && (
                                <button className="btn btn-primary btn-sm mb-2" onClick={() => this.handleDeposit(appointment.id)}>
                                  <i className="fas fa-money-bill-wave mr-1"></i>Đặt cọc
                                </button>
                              )}

                              {appointment.statusIdDataPatient?.valueVi === 'Đã khám xong' && (
                                <button className="btn btn-success btn-sm" onClick={() => this.handleOpenRatingModal(appointment)}>
                                  <i className="fas fa-star mr-1"></i>Đánh giá
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

        {/* ChatBox hiển thị khi bật */}
        {this.state.showChatbox && (
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

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo
  };
};

export default withRouter(connect(mapStateToProps)(Appointments));
