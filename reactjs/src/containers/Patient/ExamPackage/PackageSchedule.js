import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../../utils';
import { getSchedulePackageByDate } from '../../../services/userService';
import './PackageSchedule.scss';

class PackageSchedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
        }
    }

    async componentDidMount() {
        let { language } = this.props;
        let allDays = this.getArrDays(language);
        this.setState({
            allDays: allDays,
        })
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getArrDays = (language) => {
        let allDays = []
        for (let i = 0; i < 7; i++) {
            let object = {};
            if (language === LANGUAGES.VI) {
                if (i === 0) {
                    let ddMM = new Date().toLocaleDateString('vi-VI');
                    let today = `Hôm nay - ${ddMM}`;
                    object.label = today;
                } else {
                    let labelVi = new Date(new Date().setDate(new Date().getDate() + i)).toLocaleDateString('vi-VI', { weekday: 'long', day: '2-digit', month: '2-digit' });
                    object.label = this.capitalizeFirstLetter(labelVi);
                }
            } else {
                if (i === 0) {
                    let ddMM = new Date().toLocaleDateString('en-US');
                    let today = `Today - ${ddMM}`;
                    object.label = today;
                } else {
                    object.label = new Date(new Date().setDate(new Date().getDate() + i)).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });
                }
            }
            object.value = new Date(new Date().setDate(new Date().getDate() + i)).setHours(0, 0, 0, 0);
            allDays.push(object);
        }
        return allDays;
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.language !== prevProps.language) {
            let allDays = this.getArrDays(this.props.language);
            this.setState({
                allDays: allDays,
            })
        }
        if (this.props.packageIdFromParent !== prevProps.packageIdFromParent) {
            let allDays = this.getArrDays(this.props.language);
            this.setState({
                allDays: allDays,
            })
        }
    }

    handleOnChangeSelect = async (event) => {
        if (this.props.packageIdFromParent && this.props.packageIdFromParent !== -1) {
            let date = event.target.value;
            let res = await getSchedulePackageByDate(date,this.props.packageIdFromParent);
            if (res && res.errCode === 0) {
                this.setState({
                    allAvailableTime: res.data ? res.data : []
                })
            }
        }
    }

    render() {
        let { allDays, allAvailableTime } = this.state;
        let { language } = this.props;
        return (
            <div className='doctor-schedule-container'>
                <div className='all-schedule'>
                    <select onChange={(event) => this.handleOnChangeSelect(event)}>
                        {allDays && allDays.length > 0 &&
                            allDays.map((item, index) => {
                                return (
                                    <option
                                        key={index}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>
                <div className='all-available-time'>
                    <div className='text-calendar'>
                        <i className="fas fa-calendar-alt">
                            <span>
                                <FormattedMessage id="patient.detail-doctor.schedule" />
                            </span>
                        </i>
                    </div>
                    <div className='time-content'>
                        {allAvailableTime && allAvailableTime.length > 0 ?
                            <div className='time-content-btns'>
                                {allAvailableTime.map((item, index) => {
                                    let timeDisplay = language === LANGUAGES.VI ?
                                        item.timeTypeData.valueVi : item.timeTypeData.valueEn;
                                    return (
                                        <button
                                            key={index}
                                            className={language === LANGUAGES.VI ? 'btn-vie' : 'btn-en'}
                                            onClick={() => this.props.handleClickScheduleTime(item)}
                                            disabled={item.currentNumber >= item.maxNumber}
                                        >
                                            {timeDisplay}
                                        </button>
                                    )
                                })}
                            </div>
                            :
                            <div className='no-schedule'>
                                <FormattedMessage id="patient.detail-doctor.no-schedule" />
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

export default connect(mapStateToProps)(PackageSchedule); 