import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'reactstrap';
import { LANGUAGES } from '../../../utils';
import { postBookExamPackageAppointment } from '../../../services/userService';
import { toast } from 'react-toastify';
import { CommonUtils } from '../../../utils';
import * as actions from '../../../store/actions';

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
            gender: '',
            genders: '',
            timeType: '',
            language: this.props.language
        }
    }

    async componentDidMount() {
        this.props.getGenders();
    }

    buildDataGender = (data) => {
        let result = [];
        let language = this.props.language;
        if (data && data.length > 0) {
            data.map(item => {
                let object = {};
                object.label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
                object.value = item.keyMap;
                result.push(object);
            })
        }
        return result;
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.language !== prevProps.language) {
            this.setState({
                language: this.props.language
            })
        }
        if (this.props.genders !== prevProps.genders) {
            this.setState({
                genders: this.buildDataGender(this.props.genders)
            })
        }
        if (this.props.dataTime !== prevProps.dataTime) {
            if (this.props.dataTime && !prevProps.dataTime) {
                this.setState({
                    timeType: this.props.dataTime.timeType
                })
            }
        }
    }

    handleOnChangeInput = (event, id) => {
        let valueInput = event.target.value;
        let stateCopy = { ...this.state };
        stateCopy[id] = valueInput;
        this.setState({
            ...stateCopy
        })
    }

    handleOnChangeDatePicker = (event) => {
        this.setState({
            birthday: event.target.value
        })
    }

    buildTimeBooking = (dataTime) => {
        let { language } = this.props;
        if (dataTime && Object.keys(dataTime).length > 0) {
            let time = language === LANGUAGES.VI ?
                dataTime.timeTypeData.valueVi : dataTime.timeTypeData.valueEn;
            let date = language === LANGUAGES.VI ?
                new Date(+dataTime.date).toLocaleDateString('vi-VI', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) :
                new Date(+dataTime.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
            return `${time} - ${date}`
        }
        return ''
    }

    buildDoctorName = (dataTime) => {
        let { language } = this.props;
        if (dataTime && Object.keys(dataTime).length > 0) {
            let name = language === LANGUAGES.VI ?
                `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}` :
                `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName}`;
            return name;
        }
        return ''
    }

    handleConfirmBooking = async () => {
        //validate input
        let date = new Date(this.state.birthday).getTime();
        let timeString = this.buildTimeBooking(this.props.dataTime);
        let doctorName = this.buildDoctorName(this.props.dataTime);

        let res = await postBookExamPackageAppointment({
            fullName: this.state.fullName,
            phoneNumber: this.state.phoneNumber,
            email: this.state.email,
            address: this.state.address,
            reason: this.state.reason,
            date: date,
            gender: this.state.gender,
            timeType: this.state.timeType,
            language: this.props.language,
            timeString: timeString,
            doctorName: doctorName,
            packageId: this.props.detailPackage.id,
            packageName: this.props.detailPackage.name
        })

        if (res && res.errCode === 0) {
            toast.success("Booking a new appointment succeed!");
            this.props.closeBookingModal();
        } else {
            toast.error("Booking a new appointment error!");
        }
    }

    render() {
        let { isOpenModal, closeBookingModal, dataTime } = this.props;
        let doctorName = this.buildDoctorName(dataTime);
        let timeBooking = this.buildTimeBooking(dataTime);

        return (
            <Modal
                isOpen={isOpenModal}
                className={'booking-modal-container'}
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
                        <div className="doctor-infor">
                            <FormattedMessage id="patient.booking-modal.package-name" />
                            <div className="name">{this.props.detailPackage?.name}</div>
                            <div className="time">
                                <FormattedMessage id="patient.booking-modal.time" />
                                <div className="time-content">{timeBooking}</div>
                            </div>
                            <div className="price">
                                <FormattedMessage id="patient.booking-modal.price" />
                                <div className="price-content">
                                    {this.props.detailPackage?.price && new Intl.NumberFormat('vi-VN').format(this.props.detailPackage.price)} VND
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 form-group">
                                <label><FormattedMessage id="patient.booking-modal.fullName" /></label>
                                <input className="form-control" value={this.state.fullName}
                                    onChange={(event) => this.handleOnChangeInput(event, 'fullName')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label><FormattedMessage id="patient.booking-modal.phoneNumber" /></label>
                                <input className="form-control" value={this.state.phoneNumber}
                                    onChange={(event) => this.handleOnChangeInput(event, 'phoneNumber')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label><FormattedMessage id="patient.booking-modal.email" /></label>
                                <input className="form-control" value={this.state.email}
                                    onChange={(event) => this.handleOnChangeInput(event, 'email')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label><FormattedMessage id="patient.booking-modal.address" /></label>
                                <input className="form-control" value={this.state.address}
                                    onChange={(event) => this.handleOnChangeInput(event, 'address')}
                                />
                            </div>
                            <div className="col-12 form-group">
                                <label><FormattedMessage id="patient.booking-modal.reason" /></label>
                                <input className="form-control" value={this.state.reason}
                                    onChange={(event) => this.handleOnChangeInput(event, 'reason')}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label><FormattedMessage id="patient.booking-modal.birthday" /></label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={this.state.birthday}
                                    onChange={this.handleOnChangeDatePicker}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="col-6 form-group">
                                <label><FormattedMessage id="patient.booking-modal.gender" /></label>
                                <select className="form-control"
                                    onChange={(event) => this.handleOnChangeInput(event, 'gender')}
                                    value={this.state.gender}
                                >
                                    {this.state.genders && this.state.genders.length > 0 &&
                                        this.state.genders.map((item, index) => {
                                            return (
                                                <option key={index} value={item.value}>
                                                    {item.label}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="booking-modal-footer">
                        <button className="btn-booking-cancel" onClick={closeBookingModal}>
                            <FormattedMessage id="patient.booking-modal.cancel" />
                        </button>
                        <button className="btn-booking-confirm" onClick={() => this.handleConfirmBooking()}>
                            <FormattedMessage id="patient.booking-modal.confirm" />
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        genders: state.admin.genders,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getGenders: () => dispatch(actions.fetchGenderStart())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal); 