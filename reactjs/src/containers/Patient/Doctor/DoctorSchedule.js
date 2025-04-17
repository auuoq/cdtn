import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorSchedule.scss';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import { getScheduleDoctorByDate, getUserInfoByEmail } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import BookingModal from './Modal/BookingModal';
import { push } from 'connected-react-router';

class DoctorSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
            isOpenModalBooking: false,
            dataScheduleTimeModal: {}
        }
    }
    
    async componentDidMount() {
        let { language } = this.props;
        let allDays = this.getArrDays(language);

        if (this.props.doctorIdFromParent) {
            let res = await getScheduleDoctorByDate(this.props.doctorIdFromParent, allDays[0].value);
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })
        }

        this.setState({
            allDays: allDays,
        })

        //example moment
        // console.log('moment vi: ', moment(new Date()).format('dddd - DD/MM'));
        // console.log('moment en: ', moment(new Date()).locale('en').format('ddd - DD/MM'));
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getArrDays = (language) => {
        let allDays = [];
        for (let i = 0; i < 7; i++) {
            let object = {};
            if (language === LANGUAGES.VI) {
                if (i === 0) {
                    let ddMM = moment(new Date()).format('DD/MM');
                    let today = `Hôm nay - ${ddMM}`;
                    object.label = today;
                } else {
                    let labelVi = moment(new Date()).add(i, 'days').format('dddd - DD/MM');
                    object.label = this.capitalizeFirstLetter(labelVi);
                }

            } else {
                if (i === 0) {
                    let ddMM = moment(new Date()).format('DD/MM');
                    let today = `Today - ${ddMM}`;
                    object.label = today;
                } else {
                    object.label = moment(new Date()).add(i, 'days').locale('en').format('ddd - DD/MM');
                }
            }

            object.value = moment(new Date()).add(i, 'days').startOf('day').valueOf();
            allDays.push(object);
        }
        // console.log('arrDate: ', arrDate);

        return allDays;
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.language !== prevProps.language) {
            let allDays = this.getArrDays(this.props.language);
            this.setState({
                allDays: allDays
            })
        }
        if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
            let allDays = this.getArrDays(this.props.language);
            let res = await getScheduleDoctorByDate(this.props.doctorIdFromParent, allDays[0].value);
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })
        }
    }

    handleOnChangeSelect = async (event) => {
        if (this.props.doctorIdFromParent && this.props.doctorIdFromParent !== -1) {
            let doctorId = this.props.doctorIdFromParent;
            let date = event.target.value
            let res = await getScheduleDoctorByDate(doctorId, date);

            if (res && res.errCode === 0) {
                this.setState({
                    allAvailableTime: res.data ? res.data : []
                })
            }
        }
    }

    handleClickScheduleTime = async (time) => {
        if (time.currentNumber >= time.maxNumber) {
            return; // Do nothing if the schedule is full
        }
        if (this.props.isLoggedIn) {
            try {
                // Fetch user info using the API
                let email = this.props.userInfo.email; // Assuming userInfo is in the props after login
                let userData = await getUserInfoByEmail(email);
    
                if (userData && userData.errCode === 0) {
                    // Update state with both schedule time and user data
                    this.setState({
                        isOpenModalBooking: true,
                        dataScheduleTimeModal: time,
                        userData: userData.data  // Store the fetched user data
                    });
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        } else {
            // If not logged in, redirect to login page
            this.props.navigate('/user-login');
        }
    }

    closeBookingModal = () => {
        this.setState({
            isOpenModalBooking: false
        })
    }

    render() {
        let { allDays, allAvailableTime, isOpenModalBooking, dataScheduleTimeModal } = this.state;
        let { language } = this.props;

        return (
            <>
                <div className="doctor-schedule-container">
                    <div className="all-schedule">
                        <select onChange={(event) => this.handleOnChangeSelect(event)}>
                            {allDays && allDays.length > 0 && allDays.map((item, index) => {
                                return (
                                    <option
                                        value={item.value}
                                        key={index}
                                    >
                                        {item.label}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="all-available-time">
                        <div className="text-calendar">
                            <i className="fas fa-calendar-alt">
                                <span><FormattedMessage id="patient.detail-doctor.schedule" /></span>
                            </i>
                        </div>
                        <div className="time-content">
                            {allAvailableTime && allAvailableTime.length > 0 ?
                                <>
                                    <div className="time-content-btns">
                                        {allAvailableTime.map((item, index) => {
                                            let timeDisplay = language === LANGUAGES.VI ?
                                                item.timeTypeData.valueVi : item.timeTypeData.valueEn;
                                            
                                            // Check if the schedule is full
                                            let isFull = item.currentNumber >= item.maxNumber;

                                            return (
                                                <button
                                                    key={index}
                                                    className={`time-slot-btn ${isFull ? 'full' : ''}`}  // Thêm class 'full' nếu lịch đầy
                                                    onClick={() => !isFull && this.handleClickScheduleTime(item)}  // Vô hiệu hóa khi đầy
                                                    disabled={isFull}  // Vô hiệu hóa nút nếu lịch đầy
                                                >
                                                    {timeDisplay} {isFull ? '(Đầy)' : ''}
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
                                :
                                <div className="no-schedule">
                                    <FormattedMessage id="patient.detail-doctor.no-schedule" />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <BookingModal
                    isOpenModal={isOpenModalBooking}
                    closeBookingModal={this.closeBookingModal}
                    dataTime={dataScheduleTimeModal}
                    userData={this.state.userData}
                />
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigate: (path) => dispatch(push(path)),
        
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchedule);
