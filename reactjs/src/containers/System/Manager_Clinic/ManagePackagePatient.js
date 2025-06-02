import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './ManagePackagePatient.scss';  // Tạo file SCSS riêng (nên copy từ ManagePatient)
import DatePicker from '../../../components/Input/DatePicker';
import { getListPatientForPackageManager, sendRemedyForPackage } from '../../../services/userService';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import RemedyModal from '../Doctor/RemedyModal';  // Có thể dùng lại component RemedyModal của bác sĩ
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class ManagePackagePatient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            dataPatient: [],
            isOpenRemedyModal: false,
            dataModal: {},
            isShowLoading: false
        }
    }

    componentDidMount() {
        this.getDataPatient();
    }

    getDataPatient = async () => {
        let { user } = this.props;
        let { currentDate } = this.state;
        let formattedDate = new Date(currentDate).getTime();

        let res = await getListPatientForPackageManager({
            managerId: user.id,
            date: formattedDate
        });

        if (res && res.errCode === 0) {
            this.setState({ dataPatient: res.data || [] });
        }
    }

    handleOnChangeDatePicker = (date) => {
        this.setState({ currentDate: date[0] }, () => {
            this.getDataPatient();
        });
    }

    handleBtnConfirm = (item) => {
        let data = {
            packageId: item.packageId,
            patientId: item.patientId,
            email: item.patientData.email,
            timeType: item.timeType,
            patientName: item.patientData.firstName + ' ' + item.patientData.lastName
        }
        this.setState({
            isOpenRemedyModal: true,
            dataModal: data
        });
    }

    closeRemedyModal = () => {
        this.setState({
            isOpenRemedyModal: false,
            dataModal: {}
        });
    }

    sendRemedy = async (dataChild) => {
        let { dataModal } = this.state;
        this.setState({ isShowLoading: true });

        let res = await sendRemedyForPackage({
            email: dataChild.email,
            imgBase64: dataChild.imgBase64,
            diagnosis: dataChild.diagnosis,
            packageId: dataModal.packageId,
            patientId: dataModal.patientId,
            timeType: dataModal.timeType,
            language: this.props.language,
            patientName: dataModal.patientName
        });

        if (res && res.errCode === 0) {
            this.setState({ isShowLoading: false });
            toast.success('Send remedy succeed!');
            this.closeRemedyModal();
            await this.getDataPatient();
        } else {
            this.setState({ isShowLoading: false });
            toast.error('Something wrong...');
            console.error('Send remedy error:', res);
        }
    }

    render() {
        let { dataPatient, isOpenRemedyModal, dataModal } = this.state;
        let { language } = this.props;

        const statusMap = {
            S1: language === LANGUAGES.VI ? 'Lịch hẹn mới' : 'Waiting',
            S2: language === LANGUAGES.VI ? 'Đã xác Nhận' : 'In progress',
            S3: language === LANGUAGES.VI ? 'Đã khám' : 'Done',
        };

        return (
            <>
                <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
                >
                    <div className="manage-package-patient-container" style={{
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
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            <div><FormattedMessage id="manage-package-patient.title" defaultMessage="Quản lý bệnh nhân gói khám" /></div>
                            <div>
                                <DatePicker
                                    onChange={this.handleOnChangeDatePicker}
                                    className="form-control"
                                    value={this.state.currentDate}
                                />
                            </div>
                        </div>

                        <div className="manage-package-patient-body row">
                            {dataPatient && dataPatient.length > 0 ? (
                                dataPatient.map((item, index) => {
                                    let time = language === LANGUAGES.VI
                                        ? item?.timeTypeDataPatient?.valueVi
                                        : item?.timeTypeDataPatient?.valueEn;
                                    let formattedDate = moment(+item.date).format('DD/MM/YYYY');
                                    let status = statusMap[item.statusId] || item.statusId;

                                    return (
                                        <div className="col-12 col-md-6 col-lg-4 mb-4" key={index}>
                                            <div className="card shadow-sm border-0 h-100">
                                                <div className="card-body d-flex flex-column justify-content-between">
                                                    <h5 className="card-title text-primary">
                                                        {item?.patientData?.firstName} {item?.patientData?.lastName}
                                                    </h5>

                                                    <div className="patient-info-row d-flex justify-content-between">
                                                        <div className="patient-info-left">
                                                            <p><strong>Email:</strong> {item?.patientData?.email}</p>
                                                            <p><strong>Địa chỉ:</strong> {item?.patientData?.address}</p>
                                                            <p><strong>Số điện thoại:</strong> {item?.patientData?.phonenumber}</p>
                                                        </div>

                                                        <div className="patient-info-right">
                                                            <p><strong>Gói khám:</strong> {item?.packageData?.name}</p>
                                                            <p><strong>Thời gian:</strong> {time}</p>
                                                            <p><strong>Ngày khám:</strong> {formattedDate}</p>
                                                            <p><strong>Trạng thái:</strong> {status}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="btn btn-outline-success w-100 mt-3"
                                                        onClick={() => this.handleBtnConfirm(item)}
                                                    >
                                                        <FormattedMessage id="manage-package-patient.confirm-btn" defaultMessage="Gửi chuẩn đoán" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted fs-5"><FormattedMessage id="manage-package-patient.no-data" defaultMessage="Không có dữ liệu" /></p>
                                </div>
                            )}
                        </div>
                    </div>

                    <RemedyModal
                        isOpenModal={isOpenRemedyModal}
                        dataModal={dataModal}
                        closeRemedyModal={this.closeRemedyModal}
                        sendRemedy={this.sendRemedy}
                    />
                </LoadingOverlay>
            </>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
    user: state.user.userInfo,
});

export default connect(mapStateToProps)(ManagePackagePatient);
