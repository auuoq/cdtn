import React, { Component } from 'react';
import { connect } from 'react-redux';
import './DoctorSchedule.scss';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import {
  getScheduleDoctorByDate,
  getUserInfoByEmail,
  updateBookingSchedule,
} from '../../../services/userService';
import { FormattedMessage } from 'react-intl';

class UpdateSchedule extends Component {
  state = {
    allDays: [],
    allAvailableTime: [],
  };

  async componentDidMount() {
    const { language, doctorIdFromParent } = this.props;
    const allDays = this.getArrDays(language);
    this.setState({ allDays });

    if (doctorIdFromParent) {
      const res = await getScheduleDoctorByDate(doctorIdFromParent, allDays[0].value);
      if (res.errCode === 0) {
        this.setState({ allAvailableTime: res.data || [] });
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.language !== prevProps.language) {
      const days = this.getArrDays(this.props.language);
      this.setState({ allDays: days });
    }
    if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
      this.fetchSchedule(this.props.doctorIdFromParent, this.state.allDays[0].value);
    }
  }

  getArrDays = language => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      let label;
      const date = moment().add(i, 'days');
      if (language === LANGUAGES.VI) {
        label =
          i === 0
            ? `Hôm nay - ${date.format('DD/MM')}`
            : this.capitalizeFirstLetter(date.format('dddd - DD/MM'));
      } else {
        label =
          i === 0
            ? `Today - ${date.format('DD/MM')}`
            : date.locale('en').format('ddd - DD/MM');
      }
      days.push({ label, value: date.startOf('day').valueOf() });
    }
    return days;
  };

  fetchSchedule = async (doctorId, dateValue) => {
    const res = await getScheduleDoctorByDate(doctorId, dateValue);
    if (res.errCode === 0) {
      this.setState({ allAvailableTime: res.data || [] });
    }
  };

  handleOnChangeSelect = e => {
    this.fetchSchedule(this.props.doctorIdFromParent, e.target.value);
  };

  handleClickScheduleTime = async time => {
    // Lấy bookingId: ưu tiên prop.bookingId > time.bookingId
    const bookingId = this.props.bookingId;
    console.log('bookingId:', this.props);
    if (!bookingId) {
      return alert('Không xác định được bookingId');
    }
    if (time.currentNumber >= time.maxNumber) return;

    const { isLoggedIn, userInfo, navigate } = this.props;
    if (!isLoggedIn) {
      return navigate('/user-login');
    }

    try {
      const userRes = await getUserInfoByEmail(userInfo.email);
      if (userRes.errCode !== 0) {
        return alert('Lỗi khi lấy thông tin người dùng');
      }

      const updateRes = await updateBookingSchedule({
        bookingId,
        newDate: time.date,      // có thể datten key newDate theo API
        newTimeType: time.timeType,
      });

      if (updateRes.errCode === 0) {
        alert('Đổi lịch thành công!');
        // Refresh lại lịch nếu muốn
        this.fetchSchedule(this.props.doctorIdFromParent, this.state.allDays[0].value);
      } else {
        alert('Đổi lịch thất bại: ' + updateRes.errMessage);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đổi lịch');
    }
  };

  capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

  render() {
    const { allDays, allAvailableTime } = this.state;
    const { language } = this.props;

    return (
      <div className="doctor-schedule-container">
        <div className="all-schedule">
          <select onChange={this.handleOnChangeSelect}>
            {allDays.map((d, idx) => (
              <option key={idx} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="all-available-time">
          <div className="text-calendar">
            <i className="fas fa-calendar-alt">
              <span>
                <FormattedMessage id="patient.detail-doctor.schedule" />
              </span>
            </i>
          </div>
          <div className="time-content">
            {allAvailableTime.length > 0 ? (
              <>
                <div className="time-content-btns">
                  {allAvailableTime.map((item, idx) => {
                    const timeLabel =
                      language === LANGUAGES.VI
                        ? item.timeTypeData.valueVi
                        : item.timeTypeData.valueEn;
                    const isFull = item.currentNumber >= item.maxNumber;
                    return (
                      <button
                        key={idx}
                        className={`time-slot-btn ${isFull ? 'full' : ''}`}
                        onClick={() => !isFull && this.handleClickScheduleTime(item)}
                        disabled={isFull}
                      >
                        {timeLabel} {isFull && '(Đầy)'}
                      </button>
                    );
                  })}
                </div>
                <div className="book-free">
                  <span>
                    <FormattedMessage id="patient.detail-doctor.choose" />
                    <i className="far fa-hand-point-up"></i>
                    <FormattedMessage id="patient.detail-doctor.book-free" />
                  </span>
                </div>
              </>
            ) : (
              <div className="no-schedule">
                <FormattedMessage id="patient.detail-doctor.no-schedule" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  language: state.app.language,
  isLoggedIn: state.user.isLoggedIn,
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = dispatch => ({
  navigate: path => dispatch({ type: 'NAVIGATE', payload: path }),
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdateSchedule);