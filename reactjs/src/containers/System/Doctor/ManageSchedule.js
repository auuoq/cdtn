import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSchedule.scss';
import { FormattedMessage } from 'react-intl';
import * as actions from "../../../store/actions";
import { LANGUAGES } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { saveBulkScheduleDoctor } from '../../../services/userService'

class ManageSchedule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentDate: '',
            rangeTime: [],
        }
    }

    componentDidMount() {
        this.props.fetchAllScheduleTime();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
            let data = this.props.allScheduleTime;
            if (data && data.length > 0) {
                data = data.map(item => ({ ...item, isSelected: false }))
            }
            this.setState({
                rangeTime: data
            })
        }
    }

    handleOnChangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        })
    }

    handleClickBtnTime = (time) => {
        let { rangeTime } = this.state;
        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => {
                if (item.id === time.id) item.isSelected = !item.isSelected;
                return item;
            })
            this.setState({
                rangeTime: rangeTime
            })
        }
    }

    handleSaveSchedule = async () => {
        const { userInfo } = this.props;
        let { rangeTime, currentDate } = this.state;
        let doctorId = userInfo.id;
        let result = [];
        

        if (!currentDate) {
            toast.error("Vui lòng chọn ngày!");
            return;
        }

        if (!doctorId) {
            toast.error("Không xác định được bác sĩ!");
            return;
        }

        let formatedDate = new Date(currentDate).getTime();

        let selectedTime = rangeTime.filter(item => item.isSelected === true);
        if (selectedTime.length === 0) {
            toast.error("Vui lòng chọn ít nhất một khung giờ!");
            return;
        }

        selectedTime.forEach(schedule => {
            result.push({
                doctorId: doctorId,
                date: formatedDate,
                timeType: schedule.keyMap,
            });
        });

        let res = await saveBulkScheduleDoctor({
            arrSchedule: result,
            doctorId: doctorId,
            formatedDate: formatedDate
        });

        if (res && res.errCode === 0) {
            toast.success("Lưu lịch khám thành công!");
        } else {
            toast.error("Lỗi khi lưu lịch khám!");
            console.log("Lỗi saveBulkScheduleDoctor >>>", res);
        }
    }

    render() {
        let { rangeTime } = this.state;
        let { language } = this.props;
        let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

        return (
            <div className="manage-schedule-container" style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "30px",
                marginTop: "60px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}>
                <div style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "30px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #eee",
                }}>
                    <FormattedMessage id="manage-schedule.title" />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-6 form-group">
                            <label><FormattedMessage id="manage-schedule.choose-date" /></label>
                            <DatePicker
                                onChange={this.handleOnChangeDatePicker}
                                className="form-control"
                                value={this.state.currentDate}
                                minDate={yesterday}
                            />
                        </div>
                        <div className="col-12 pick-hour-container">
                            {rangeTime && rangeTime.length > 0 &&
                                rangeTime.map((item, index) => (
                                    <button
                                        className={item.isSelected ? "btn btn-schedule btn-primary" : "btn btn-schedule"}
                                        style={{ minWidth: '120px' }}
                                        key={index}
                                        onClick={() => this.handleClickBtnTime(item)}
                                    >
                                        {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                    </button>
                                ))
                            }
                        </div>
                        <div className='col-12'>
                            <button className="btn btn-primary btn-save-schedule"
                                onClick={this.handleSaveSchedule}
                            >
                                <FormattedMessage id="manage-schedule.save" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        allScheduleTime: state.admin.allScheduleTime,
        userInfo: state.user.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
