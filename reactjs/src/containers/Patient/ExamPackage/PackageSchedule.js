// PackageSchedule.js
import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../../utils';
import { getSchedulePackageByDate } from '../../../services/userService';
import BookingModal from './BookingModal';
import './PackageSchedule.scss';

class PackageSchedule extends Component {
    state = {
        allDays: [],
        allAvailableTime: [],
        isOpenModalBooking: false,
        dataScheduleTimeModal: {},
    };

    componentDidMount() {
        const allDays = this.getArrDays(this.props.language);
        this.setState({ allDays });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language || prevProps.packageIdFromParent !== this.props.packageIdFromParent) {
            const allDays = this.getArrDays(this.props.language);
            this.setState({ allDays });
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getArrDays = (language) => {
        const allDays = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            let label;

            if (language === LANGUAGES.VI) {
                label = i === 0
                    ? `Hôm nay - ${date.toLocaleDateString('vi-VI')}`
                    : this.capitalizeFirstLetter(date.toLocaleDateString('vi-VI', { weekday: 'long', day: '2-digit', month: '2-digit' }));
            } else {
                label = i === 0
                    ? `Today - ${date.toLocaleDateString('en-US')}`
                    : date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });
            }

            allDays.push({ label, value: date.setHours(0, 0, 0, 0) });
        }
        return allDays;
    };

    handleOnChangeSelect = async (event) => {
        const date = event.target.value;
        const { packageIdFromParent } = this.props;

        if (packageIdFromParent && packageIdFromParent !== -1) {
            const res = await getSchedulePackageByDate(date, packageIdFromParent);
            if (res && res.errCode === 0) {
                this.setState({ allAvailableTime: res.data || [] });
            }
        }
    };

    handleClickScheduleTime = (time) => {
        this.setState({
            isOpenModalBooking: true,
            dataScheduleTimeModal: time,
        });
    };

    closeBookingModal = () => {
        this.setState({
            isOpenModalBooking: false,
            dataScheduleTimeModal: {},
        });
    };

    render() {
        const { allDays, allAvailableTime, isOpenModalBooking, dataScheduleTimeModal } = this.state;
        const { language, detailPackage } = this.props;

        return (
            <div className='doctor-schedule-container'>
                <div className='all-schedule'>
                    <select onChange={this.handleOnChangeSelect}>
                        {allDays.map((item, index) => (
                            <option key={index} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='all-available-time'>
                    <div className='text-calendar'>
                        <i className="fas fa-calendar-alt">
                            <span><FormattedMessage id="patient.detail-doctor.schedule" /></span>
                        </i>
                    </div>

                    <div className='time-content'>
                        {allAvailableTime.length > 0 ? (
                            <div className='time-content-btns'>
                                {allAvailableTime.map((item, index) => {
                                    const timeDisplay = language === LANGUAGES.VI
                                        ? item.timeTypeData.valueVi
                                        : item.timeTypeData.valueEn;

                                    const isFull = item.currentNumber >= item.maxNumber;

                                    return (
                                        <button
                                            key={index}
                                            className={`time-slot-btn ${isFull ? 'full' : ''}`}
                                            onClick={() => !isFull && this.handleClickScheduleTime(item)}
                                            disabled={isFull}
                                        >
                                            {timeDisplay} {isFull ? '(Đầy)' : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className='no-schedule'>
                                <FormattedMessage id="patient.detail-doctor.no-schedule" />
                            </div>
                        )}
                    </div>

                </div>

                {/* BookingModal dùng nội bộ */}
                <BookingModal
                    isOpenModal={isOpenModalBooking}
                    closeBookingModal={this.closeBookingModal}
                    dataTime={dataScheduleTimeModal}
                    detailPackage={detailPackage}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(PackageSchedule);
