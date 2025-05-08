
import React, { Component } from 'react';
import { connect } from "react-redux";
import './Schedule_Package.scss';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import * as actions from "../../../store/actions";
import { LANGUAGES } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { bulkCreateScheduleForPackage, getExamPackagesDetailByManager  } from '../../../services/userService'

class ManageSchedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listPackages: [],
            selectedPackage: {},
            currentDate: '',
            rangeTime: []
        }
    }

    async componentDidMount() {
        await this.fetchAllPackages();
        this.props.fetchAllScheduleTime();
    }

    async fetchAllPackages() {
        const { userId } = this.props; // Lấy userId từ props (có thể lấy từ redux hoặc props)
        let res = await getExamPackagesDetailByManager(userId.id);
        if (res && res.errCode === 0) {
            let dataSelect = this.buildDataInputSelect(res.data);
            this.setState({
                listPackages: dataSelect
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
            let data = this.props.allScheduleTime;
            if (data && data.length > 0) {
                data = data.map(item => ({ ...item, isSelected: false }))
                this.setState({ rangeTime: data });
            }
        }
    }

    buildDataInputSelect = (inputData) => {
        let result = [];
        if (inputData && inputData.length > 0) {
            inputData.map((item) => {
                result.push({ label: item.name, value: item.id });
            });
        }
        return result;
    }

    handleChangeSelect = (selectedOption) => {
        this.setState({ selectedPackage: selectedOption });
    };

    handleOnChangeDatePicker = (date) => {
        this.setState({ currentDate: date[0] });
    }

    handleClickBtnTime = (time) => {
        let { rangeTime } = this.state;
        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => {
                if (item.id === time.id) item.isSelected = !item.isSelected;
                return item;
            })
            this.setState({ rangeTime });
        }
    }

    handleSaveSchedule = async () => {
        let { rangeTime, selectedPackage, currentDate } = this.state;
        let result = [];

        if (!currentDate) {
            toast.error("Vui lòng chọn ngày!");
            return;
        }
        if (_.isEmpty(selectedPackage)) {
            toast.error("Vui lòng chọn gói khám!");
            return;
        }

        let formatedDate = new Date(currentDate).getTime();
        let selectedTime = rangeTime.filter(item => item.isSelected === true);
        if (selectedTime.length === 0) {
            toast.error("Vui lòng chọn khung giờ!");
            return;
        }

        selectedTime.forEach(item => {
            result.push({
                packageId: selectedPackage.value,
                date: formatedDate,
                timeType: item.keyMap
            });
        });

        let res = await bulkCreateScheduleForPackage({
            arrSchedule: result,
            packageId: selectedPackage.value,
            formatedDate
        });

        if (res && res.errCode === 0) {
            toast.success("Tạo lịch gói khám thành công!");
        } else {
            toast.error("Có lỗi xảy ra khi tạo lịch gói khám!");
            console.log(res);
        }
    }

    render() {
        let { rangeTime } = this.state;
        let { language } = this.props;
        let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

        return (
            <div className="manage-schedule-container">
                <div className="title">
                    <FormattedMessage id="manage-schedule.title" />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-6 form-group">
                            <label>Chọn gói khám</label>
                            <Select
                                value={this.state.selectedPackage}
                                onChange={this.handleChangeSelect}
                                options={this.state.listPackages}
                            />
                        </div>
                        <div className="col-6 form-group">
                            <label>Chọn ngày</label>
                            <DatePicker
                                onChange={this.handleOnChangeDatePicker}
                                className="form-control"
                                value={this.state.currentDate}
                                minDate={yesterday}
                            />
                        </div>
                        <div className="col-12 pick-hour-container">
                            {rangeTime && rangeTime.length > 0 &&
                                rangeTime.map((item, index) => {
                                    return (
                                        <button
                                            className={item.isSelected ? "btn btn-schedule btn-primary" : "btn btn-schedule"}
                                            key={index}
                                            onClick={() => this.handleClickBtnTime(item)}
                                        >
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </button>
                                    );
                                })
                            }
                        </div>
                        <div className="col-12">
                            <button className="btn btn-primary btn-save-schedule"
                                onClick={this.handleSaveSchedule}
                            >
                                Lưu lịch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    allScheduleTime: state.admin.allScheduleTime,
    userId: state.user.userInfo
});

const mapDispatchToProps = dispatch => ({
    fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
