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
  submitFeedbackPackage,
  updateBookingSchedule,      // API mới
} from '../../../services/userService';
import { toast } from 'react-toastify';
import ChatBox from '../../../components/chatbox';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import UpdateSchedule from '../Doctor/UpdateSchedule';
import PackageSchedule from '../ExamPackage/PackageSchedule';
import UpdateBookingPackage from '../ExamPackage/updateBookingPackage';

class Appointments extends Component {
  state = {
    // Danh sách lịch
    appointments: [],
    loading: true,
    // Filter
    selectedStatus: 'all',
    statuses: [],
    typeFilter: 'all',
    // Modal đánh giá
    showRatingModal: false,
    selectedAppointment: null,
    commentText: '',
    // Hiển thị chẩn đoán
    showDiagnosisForId: null,
    // Chatbox
    showChatbox: false,
    // Modal thay đổi giờ hẹn
    showRescheduleModal: false,
    rescheduleBooking: null,
    newDate: '',
    newTimeType: '',
  };

  async componentDidMount() {
    await this.fetchAppointments();
  }

  fetchAppointments = async () => {
    const { userInfo } = this.props;
    if (!userInfo?.id) return;

    this.setState({ loading: true });
    try {
      const [res1, res2] = await Promise.all([
        getUserBookings(userInfo.id),
        getUserPackageBookings(userInfo.id),
      ]);

      const appointments = [
        ...(res1?.data?.map(item => ({ ...item, type: 'doctor' })) || []),
        ...(res2?.data?.map(item => ({ ...item, type: 'package' })) || []),
      ];

      const statuses = [
        ...new Set(
          appointments.map(a => a.statusIdDataPatient?.valueVi || 'Chưa xác định')
        ),
      ];

      this.setState({
        appointments,
        statuses: ['all', ...statuses],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Đã xảy ra lỗi khi tải lịch hẹn');
      this.setState({ loading: false });
    }
  };

  getNextAppointmentId(filtered) {
    const now = Date.now();

    const timeOrder = {
      T1: 1, T2: 2, T3: 3, T4: 4, T5: 5, T6: 6, T7: 7,
      T8: 8, T9: 9, T10: 10, T11: 11, T12: 12, T13: 13
    };

    const upcoming = filtered.filter(a => {
      const appointmentTime = +a.date; // timestamp for the day
      const today = new Date();
      const isToday = new Date(appointmentTime).toDateString() === today.toDateString();
      if (appointmentTime > now) return true;
      if (isToday) {
        const timeTypeValue = timeOrder[a.timeType] || 99;
        const currentHour = today.getHours();
        // Approx logic: map current hour to timeType ~ 1 slot/hour
        return timeTypeValue > currentHour; 
      }
      return false;
    });

    if (!upcoming.length) return null;

    return upcoming.reduce((next, a) => {
      const aDate = +a.date;
      const bDate = +next.date;

      if (aDate < bDate) return a;
      if (aDate > bDate) return next;

      const aTime = timeOrder[a.timeType] || 99;
      const bTime = timeOrder[next.timeType] || 99;

      return aTime < bTime ? a : next;
    }).id;
  }


  // Filter handlers
  handleStatusChange = selectedStatus => {
    this.setState({ selectedStatus });
  };
  handleTypeFilterChange = typeFilter => {
    this.setState({ typeFilter });
  };

  // Format ngày
  formatDate = timestamp => {
    if (!timestamp) return 'N/A';
    const d = new Date(+timestamp);
    return d.toLocaleDateString('vi-VN');
  };

  // Chi tiết
  handleDetail = appointment => {
    if (appointment.type === 'doctor') {
      window.open(`/detail-doctor/${appointment.doctorId}`, '_blank');
    } else {
      window.open(`/detail-exam-package/${appointment.packageId}`, '_blank');
    }
  };

  // Hủy lịch
  handleCancel = async appointment => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    let res;
    if (appointment.type === 'package') {
      res = await deletePackageAppointment(appointment.id);
    } else {
      res = await deleteAppointment(appointment.id);
    }
    if (res?.errCode === 0) {
      toast.success('Hủy lịch hẹn thành công');
      await this.fetchAppointments();
    } else {
      toast.error(res?.errMessage || 'Hủy lịch thất bại');
    }
  };

  // Đặt cọc
  handleDeposit = appointmentId => {
    this.props.history.push(`/deposit/${appointmentId}`);
  };

  // Đánh giá
  handleOpenRatingModal = appointment => {
    this.setState({
      showRatingModal: true,
      selectedAppointment: appointment,
      commentText: '',
    });
  };
  handleCloseRatingModal = () => {
    this.setState({ showRatingModal: false, selectedAppointment: null });
  };
  handleRatingSubmit = async () => {
    const { selectedAppointment, commentText } = this.state;
    let res;
    if (selectedAppointment.type === 'doctor') {
      res = await submitFeedback({
        appointmentId: selectedAppointment.id,
        feedback: commentText,
      });
    } else {
      res = await submitFeedbackPackage({
        appointmentId: selectedAppointment.id,
        feedback: commentText,
      });
    }
    if (res?.errCode === 0) {
      toast.success('Đánh giá thành công');
      this.handleCloseRatingModal();
      await this.fetchAppointments();
    } else {
      toast.error(res?.errMessage || 'Gửi đánh giá thất bại');
    }
  };

  // Toggle UI
  toggleChatbox = () => {
    this.setState(st => ({ showChatbox: !st.showChatbox }));
  };
  handleToggleDiagnosis = appointmentId => {
    this.setState(st => ({
      showDiagnosisForId:
        st.showDiagnosisForId === appointmentId ? null : appointmentId,
    }));
  };

  // Sắp xếp và lọc
  getFilteredAppointments = () => {
    const { appointments, selectedStatus, typeFilter } = this.state;
    let filtered = appointments
      .filter(a => {
        const s = a.statusIdDataPatient?.valueVi || '';
        return (
          (selectedStatus === 'all' || s === selectedStatus) &&
          (typeFilter === 'all' || a.type === typeFilter)
        );
      })
      .sort((a, b) => {
        const order = {
          'Lịch hẹn mới': 1,
          'Đã xác nhận': 2,
          'Đã khám xong': 3,
          'Đã hủy': 4,
        };
        const sa = order[a.statusIdDataPatient?.valueVi] || 99;
        const sb = order[b.statusIdDataPatient?.valueVi] || 99;
        return sa - sb;
      });

    const nextId = this.getNextAppointmentId(filtered);
    if (nextId) {
      const next = filtered.find(a => a.id === nextId);
      filtered = [ next, ...filtered.filter(a => a.id !== nextId) ];
    }
    return filtered;
  };

  renderStatusBadge = status => {
    let cls = 'badge-secondary';
    if (status === 'Lịch hẹn mới') cls = 'badge-primary';
    if (status === 'Đã xác nhận') cls = 'badge-success';
    if (status === 'Đã khám xong') cls = 'badge-info';
    if (status === 'Đã hủy') cls = 'badge-danger';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  // ==== Reschedule ====
  openReschedule = appointment => {
    this.setState({
      showRescheduleModal: true,
      rescheduleBooking: appointment,
      newDate: appointment.date,
      newTimeType: appointment.timeType,
    });
    // Reset new date and time type to current booking values
    console.log('Opening reschedule for:', appointment);    
  };
  closeReschedule = () => {
    this.setState({ showRescheduleModal: false, rescheduleBooking: null });
  };
  handleRescheduleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  renderRescheduleModal() {
    const {
      showRescheduleModal,
      rescheduleBooking,
    } = this.state;
    if (!showRescheduleModal || !rescheduleBooking) return null;
    return (
      <div className="reschedule-modal">
        <div className="reschedule-content card p-4">
          <h5>Thay đổi lịch hẹn</h5>
          {/* Thông tin bác sĩ + lịch cũ */}
          <ProfileDoctor
            doctorId={rescheduleBooking.doctorId}
            isShowDescriptionDoctor={false}
            isSHowLinkDetail={false}
            isShowPrice={false}
          />
          <div className="dt-content-right">
              <div className="doctor-schedule">
                  <UpdateSchedule 
                  doctorIdFromParent={rescheduleBooking.doctorId}
                  bookingId={rescheduleBooking.id}
                   />
              </div>
              <div className="doctor-extra-infor">
                  <DoctorExtraInfor doctorIdFromParent={rescheduleBooking.doctorId} />
              </div>
          </div>
          <hr />
          <div className="text-right">
            <button
              className="btn btn-secondary mr-2"
              onClick={this.closeReschedule}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  openReschedulePackage = appointment => {
    this.setState({
      showRescheduleModal: true,
      rescheduleBooking: appointment,
      newDate: appointment.date,
      newTimeType: appointment.timeType,
    });
    console.log('Opening reschedule for exam package:', appointment);
  };

  closeReschedulePackage = () => {
    this.setState({ showRescheduleModal: false, rescheduleBooking: null });
  };
  handleReschedulePackageChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  renderReschedulePackageModal() {
    const { showRescheduleModal, rescheduleBooking } = this.state;
    if (!showRescheduleModal || !rescheduleBooking) return null;

    return (
      <div className="reschedule-modal">
        <div className="reschedule-content card p-4">
          <h5>Thay đổi lịch hẹn gói khám</h5>

          {/* Hiển thị thông tin gói khám */}
          <div className="package-info mb-3">
            {/* Hiển thị ảnh gói */}
            <div>
              {rescheduleBooking.packageData?.image && (
              <img
                src={rescheduleBooking.packageData.image}
                alt={rescheduleBooking.packageData.name}
                className="img-fluid mb-3"
                style={{ maxWidth: '200px', height: 'auto', borderRadius: 8 }}
              />
            )}
            </div>
            
            <strong>Gói khám:</strong> {rescheduleBooking.packageData?.name}<br />
            <strong>Ngày hiện tại:</strong> {this.formatDate(rescheduleBooking.date)}<br />
            <strong>Khung giờ hiện tại:</strong> {rescheduleBooking.timeTypeDataPatient?.valueVi}
          </div>

          {/* Cho phép chọn lại lịch mới */}
          <UpdateBookingPackage
            packageIdFromParent={rescheduleBooking.packageId}
            detailPackage={rescheduleBooking.packageData}
            isReschedule={true}
            bookingId={rescheduleBooking.id}
          />

          <hr />
          <div className="text-right">
            <button
              className="btn btn-secondary mr-2"
              onClick={this.closeReschedulePackage}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==== End Reschedule ====


  renderRatingModal() {
    const { showRatingModal, commentText } = this.state;
    if (!showRatingModal) return null;
    return (
      <div className="rating-modal">
        <div className="rating-content">
          <h5>Đánh giá cuộc hẹn</h5>
          <label>Nhận xét:</label>
          <textarea
            className="form-control mb-3"
            rows="4"
            value={commentText}
            onChange={e => this.setState({ commentText: e.target.value })}
          />
          <button
            className="btn btn-primary mr-2"
            onClick={this.handleRatingSubmit}
          >
            Gửi đánh giá
          </button>
          <button
            className="btn btn-secondary"
            onClick={this.handleCloseRatingModal}
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  isTomorrow = timestamp => {
    const date = new Date(+timestamp);
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return (
      date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate()
    );
  };

  render() {
    const {
      loading,
      statuses,
      selectedStatus,
      typeFilter,
      appointments,
      showChatbox,
    } = this.state;
    const filtered = this.getFilteredAppointments();
    const nextId = filtered.length ? filtered[0].id : null;

    return (
      <>
        <HomeHeader />

        {/* Modals */}
        {this.renderRatingModal()}
        {this.state.rescheduleBooking?.packageId
          ? this.renderReschedulePackageModal()
          : this.renderRescheduleModal()}

        <div className="appointments-page container-fluid py-4">
          <div className="row">
            <div className="col-12">
              {/* Filter */}
              <div className="appointments-header mb-4 d-flex justify-content-between">
                <div className="btn-group">
                  {statuses.map(s => (
                    <button
                      key={s}
                      className={`btn ${
                        selectedStatus === s ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      onClick={() => this.handleStatusChange(s)}
                    >
                      {s === 'all' ? 'Tất cả' : s}
                    </button>
                  ))}
                </div>
                <div className="btn-group">
                  <button
                    className={`btn ${
                      typeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'
                    }`}
                    onClick={() => this.handleTypeFilterChange('all')}
                  >
                    Tất cả
                  </button>
                  <button
                    className={`btn ${
                      typeFilter === 'doctor' ? 'btn-primary' : 'btn-outline-primary'
                    }`}
                    onClick={() => this.handleTypeFilterChange('doctor')}
                  >
                    Bác sĩ
                  </button>
                  <button
                    className={`btn ${
                      typeFilter === 'package' ? 'btn-primary' : 'btn-outline-primary'
                    }`}
                    onClick={() => this.handleTypeFilterChange('package')}
                  >
                    Gói khám
                  </button>
                </div>
              </div>

              {/* Nội dung */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state text-center py-5">
                  <i className="fas fa-calendar-alt fa-3x text-muted mb-3" />
                  <h4>Không có lịch hẹn nào</h4>
                  <p className="text-muted">Bạn chưa có lịch hẹn nào trong mục này</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {filtered.map((app, idx) => (
                    <div
                      key={app.id}
                      className={`appointment-card card mb-4${app.id === nextId ? ' next-appointment' : ''}`}
                    >
                      {/* —————— BANNER NGÀY MAI —————— */}
                      {this.isTomorrow(app.date) && (
                        <div className="tomorrow-banner">
                          Lịch hẹn vào ngày mai
                        </div>
                      )}
                  
                      {/* Label chỉ cho lịch gần nhất */}
                      {app.id === nextId && (
                        <div className="next-label">
                          Lịch hẹn gần nhất
                        </div>
                      )}
                      <div className="card-body row">
                        {/* Ảnh + info */}
                      <div className="col-md-8">
                        <div className="row">
                          <div className="col-12 col-md-9 d-flex align-items-center mb-3 mb-md-0">
                            <img
                              src={
                                app.type === 'doctor'
                                  ? app.doctorData?.image
                                  : app.packageData?.image
                              }
                              alt=""
                              style={{
                                width: 130,
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginRight: 15,
                              }}
                            />
                            <div className="appointment-info flex-grow-1">
                              <h4 className="card-title">
                                {app.type === 'doctor'
                                  ? `${app.doctorData.firstName} ${app.doctorData.lastName}`
                                  : app.packageData?.name}
                              </h4>
                              {app.type === 'doctor' && (
                                <p className="mb-1 text-muted">
                                  <i className="fas fa-stethoscope mr-1" />
                                  {app.doctorBooking?.specialtyData?.name}
                                </p>
                              )}
                              <p className="mb-1 text-muted">
                                <i className="fas fa-map-marker-alt mr-1" />
                                {app.type === 'doctor'
                                  ? app.doctorBooking?.clinicData?.address
                                  : app.packageData?.clinicInfo?.address}
                              </p>
                              <div className="appointment-meta mb-2">
                                <div className="meta-item">
                                  <i className="fas fa-calendar-alt mr-2" />
                                  {this.formatDate(app.date)}
                                </div>
                                <div className="meta-item">
                                  <i className="fas fa-clock mr-2" />
                                  {app.timeTypeDataPatient?.valueVi}
                                </div>
                              </div>
                              <div className="status-container mb-2">
                                {this.renderStatusBadge(app.statusIdDataPatient?.valueVi)}
                              </div>
                            </div>
                          </div>

                          <div className="col-12 col-md-3 d-flex justify-content-center align-items-center">
                            <div className="qr-section text-center">
                              <img
                                src={app.qrCode}
                                alt="QR Code"
                                className="border rounded shadow-sm"
                                style={{
                                  width: 120,
                                  height: 120,
                                  objectFit: 'contain',
                                  border:"2px solid #fff"
                                }}
                              />
                              <div className="mt-2 small text-muted" style={{ fontWeight: 500 }}>
                                Mã xác nhận
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                        {/* Actions */}
                        <div className="col-md-4">
                          <div className="appointment-actions">
                            <button
                              className="btn btn-outline-info btn-sm mb-2"
                              onClick={() => this.handleDetail(app)}
                            >
                              <i className="fas fa-info-circle mr-1" />
                              Chi tiết
                            </button>

                            {['Lịch hẹn mới', 'Đã xác nhận'].includes(
                              app.statusIdDataPatient?.valueVi
                            ) && (
                              <button
                                className="btn btn-danger btn-sm mb-2"
                                onClick={() => this.handleCancel(app)}
                              >
                                <i className="fas fa-times mr-1" />
                                Hủy lịch
                              </button>
                            )}

                            {/* Đặt cọc nếu cần */}
                            {app.packageData &&
                              app.statusIdDataPatient?.valueVi ===
                                'Lịch hẹn mới' &&
                              app.packageData?.isDepositRequired && (
                                <button
                                  className="btn btn-primary btn-sm mb-2"
                                  onClick={() => this.handleDeposit(app.id)}
                                >
                                  <i className="fas fa-money-bill-wave mr-1" />
                                  Đặt cọc
                                </button>
                              )}

                            {/* Thông báo email nếu không cần cọc */}
                            {app.statusIdDataPatient?.valueVi ===
                              'Lịch hẹn mới' &&
                              (!app.packageData ||
                                !app.packageData?.isDepositRequired) && (
                                <div
                                  className="text-info mb-2"
                                  style={{ fontWeight: 600 }}
                                >
                                  Vui lòng xác nhận qua email
                                </div>
                              )}

                            {/* Đánh giá */}
                            {app.statusIdDataPatient?.valueVi ===
                              'Đã khám xong' && (
                              <button
                                className="btn btn-success btn-sm mb-2"
                                onClick={() => this.handleOpenRatingModal(app)}
                              >
                                <i className="fas fa-star mr-1" />
                                Đánh giá
                              </button>
                            )}

                            {/* Xem chẩn đoán */}
                            {app.statusIdDataPatient?.valueVi ===
                              'Đã khám xong' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  this.handleToggleDiagnosis(app.id)
                                }
                              >
                                <i className="fas fa-file-medical-alt mr-1" />
                                {this.state.showDiagnosisForId === app.id
                                  ? 'Ẩn'
                                  : 'Xem'}{' '}
                                chẩn đoán
                              </button>
                            )}

                            {/* Thay đổi giờ hẹn */}
                            {app.statusIdDataPatient?.valueVi === 'Đã xác nhận' && (
                              <button
                                className="btn btn-warning btn-sm mb-2"
                                onClick={() =>
                                  app.type === 'doctor'
                                    ? this.openReschedule(app)
                                    : this.openReschedulePackage(app)
                                }
                              >
                                <i className="fas fa-edit mr-1" />
                                Thay đổi giờ hẹn
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Chẩn đoán (toggle) */}
                        {this.state.showDiagnosisForId === app.id && (
                          <div className="diagnosis-section mt-3 p-3 border rounded bg-light">
                            <h6>Chẩn đoán:</h6>
                            <p>{app.diagnosis || 'Chưa có chẩn đoán'}</p>
                            <img
                              src={app.remedyImage || 'https://via.placeholder.com/150'}
                              alt="Chẩn đoán"
                              style={{
                                width: 120,
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 8,
                              }}
                            />
                          </div>
                        )}
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

const mapStateToProps = state => ({
  userInfo: state.user.userInfo,
});

export default withRouter(connect(mapStateToProps)(Appointments));