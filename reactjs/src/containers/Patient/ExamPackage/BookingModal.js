import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CarouselIndicators, Modal } from 'reactstrap';
import DatePicker from '../../../components/Input/DatePicker';
import Select from 'react-select';
import { LANGUAGES } from '../../../utils';
import * as actions from '../../../store/actions';
import { postBookExamPackageAppointment } from '../../../services/userService';
import { toast } from 'react-toastify';
import moment from 'moment';
// import './BookingModal.scss';

class BookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      phoneNumber: '',
      email: '',
      address: '',
      reason: '',
      birthday: '',
      selectedGender: null,
      gendersOptions: [],
      timeType: '',
      language: this.props.language
    };
  }

  componentDidMount() {
    this.props.getGenders();
  }

  componentDidUpdate(prevProps) {
    // khi load danh sách gender
    if (this.props.genders !== prevProps.genders || this.props.language !== prevProps.language) {
      const gendersOptions = this.props.genders.map(item => ({
        label: this.props.language === LANGUAGES.VI ? item.valueVi : item.valueEn,
        value: item.keyMap
      }));
      this.setState({ gendersOptions });
    }
    // khi userData thay đổi: pre-fill thông tin
    if (this.props.userData && this.props.userData !== prevProps.userData) {
      const { firstName, lastName, email, phonenumber, address } = this.props.userData;
      console.log('userData', this.props.userData);
      this.setState({
        fullName: `${firstName || ''} ${lastName || ''}`.trim(),
        phoneNumber: phonenumber || '',
        email: email || '',
        address: address || ''
      });
    }
    // khi chọn thời gian mới
    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime && Object.keys(this.props.dataTime).length) {
        this.setState({
          timeType: this.props.dataTime.timeType
        });
      }
    }
  }

  buildTimeBooking = (dataTime) => {
    if (!dataTime || !Object.keys(dataTime).length) return '';
    const { language } = this.props;
    const time = language === LANGUAGES.VI
      ? dataTime.timeTypeData.valueVi
      : dataTime.timeTypeData.valueEn;
    const date = language === LANGUAGES.VI
      ? moment(+dataTime.date).format('dddd - DD/MM/YYYY')
      : moment(+dataTime.date).locale('en').format('ddd - MM/DD/YYYY');
    return `${time} - ${date}`;
  }

  handleInputChange = (e, field) => {
    this.setState({ [field]: e.target.value });
  }

  handleDateChange = (dateArr) => {
    if (dateArr && dateArr.length) {
      this.setState({ birthday: dateArr[0] });
    }
  }

  handleGenderChange = (selectedGender) => {
    this.setState({ selectedGender });
  }

  handleConfirmBooking = async () => {
    const { detailPackage, dataTime, language } = this.props;
    const { fullName, phoneNumber, email, address, reason, birthday, selectedGender, timeType } = this.state;
    if (!fullName || !phoneNumber || !email) {
      toast.error('Vui lòng điền đầy đủ họ tên, số điện thoại và email');
      return;
    }
    const dateTimestamp = birthday ? new Date(birthday).getTime() : '';
    const timeString = this.buildTimeBooking(dataTime);
    const res = await postBookExamPackageAppointment({
      fullName,
      phoneNumber,
      email,
      address,
      reason,
      date: this.props.dataTime.date,
      birthday: dateTimestamp,
      selectedGender: selectedGender?.value,
      timeType,
      language,
      timeString,
      packageId: detailPackage?.id,
      packageName: detailPackage?.name
    });
    if (res && res.errCode === 0) {
      toast.success('Đặt lịch khám gói thành công!');
      this.props.closeBookingModal();
    } else {
      toast.error('Đặt lịch khám gói thất bại.');
    }
  }

  render() {
    const { isOpenModal, closeBookingModal, dataTime, detailPackage } = this.props;
    const { fullName, phoneNumber, email, address, reason, birthday, gendersOptions, selectedGender } = this.state;
    const timeBooking = this.buildTimeBooking(dataTime);

    return (
      <Modal
        isOpen={isOpenModal}
        className="booking-modal-container"
        size="lg"
        centered
      >
        <div className="booking-modal-content">
          <div className="booking-modal-header">
            <span className="left">
              <FormattedMessage id="patient.booking-modal.title" />
            </span>
            <span className="right" onClick={closeBookingModal}>
              <i className="fas fa-times"></i>
            </span>
          </div>
          <div className="booking-modal-body">
            <div className="package-infor">
              <img
                src={detailPackage?.image || ''}
                alt="package"
                className="booking-package-image"
              />
              <h3>{detailPackage?.name}</h3>
              <div className="time">
                <FormattedMessage id="patient.booking-modal.time" />
                <div className="time-content">{timeBooking}</div>
              </div>
              <div className="price">
                <FormattedMessage id="patient.booking-modal.price" />
                <div className="price-content">
                  {detailPackage?.price && new Intl.NumberFormat('vi-VN').format(detailPackage.price)} VND
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6 form-group">
                <label><FormattedMessage id="patient.booking-modal.fullName" /></label>
                <input
                  className="form-control"
                  value={fullName}
                  onChange={e => this.handleInputChange(e, 'fullName')}
                />
              </div>
              <div className="col-6 form-group">
                <label><FormattedMessage id="patient.booking-modal.phoneNumber" /></label>
                <input
                  className="form-control"
                  value={phoneNumber}
                  onChange={e => this.handleInputChange(e, 'phoneNumber')}
                />
              </div>
              <div className="col-6 form-group">
                <label><FormattedMessage id="patient.booking-modal.email" /></label>
                <input
                  className="form-control"
                  value={email}
                  onChange={e => this.handleInputChange(e, 'email')}
                />
              </div>
              <div className="col-6 form-group">
                <label><FormattedMessage id="patient.booking-modal.address" /></label>
                <input
                  className="form-control"
                  value={address}
                  onChange={e => this.handleInputChange(e, 'address')}
                />
              </div>
              <div className="col-12 form-group">
                <label><FormattedMessage id="patient.booking-modal.reason" /></label>
                <input
                  className="form-control"
                  value={reason}
                  onChange={e => this.handleInputChange(e, 'reason')}
                />
              </div>
              <div className="col-6 form-group">
                <label><FormattedMessage id="patient.booking-modal.birthday" /></label>
                <DatePicker
                  onChange={this.handleDateChange}
                  className="form-control"
                  value={birthday}
                />
              </div>
              <div className="col-6 form-group">
                <label><FormattedMessage id="patient.booking-modal.gender" /></label>
                <Select
                  value={selectedGender}
                  onChange={this.handleGenderChange}
                  options={gendersOptions}
                />
              </div>
            </div>
          </div>
          <div className="booking-modal-footer">
            <button
              className="btn-booking-confirm"
              onClick={this.handleConfirmBooking}
            >
              <FormattedMessage id="patient.booking-modal.btnConfirm" />
            </button>
            <button
              className="btn-booking-cancel"
              onClick={closeBookingModal}
            >
              <FormattedMessage id="patient.booking-modal.btnCancel" />
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  language: state.app.language,
  genders: state.admin.genders,
  userData: state.user.userInfo
});

const mapDispatchToProps = dispatch => ({
  getGenders: () => dispatch(actions.fetchGenderStart())
});

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
