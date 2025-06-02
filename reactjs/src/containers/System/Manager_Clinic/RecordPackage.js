import React, { Component } from 'react';
import { connect } from "react-redux";
import './RecordPackage.scss';
import { getListAllExamPackagePatientWithStatusS3, toggleIsDisplayedStatusForPackage } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import moment from 'moment';

class RecordPackage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataPatients: [],
            isShowLoading: false,
            searchKeyword: '',
            expandedDiagnosis: {},
        };
    }

    async componentDidMount() {
        this.fetchData();
    }

    fetchData = async () => {
        let { user } = this.props;
        this.setState({ isShowLoading: true });

        try {
            let res = await getListAllExamPackagePatientWithStatusS3(user.id);
            if (res && res.errCode === 0) {
                this.setState({
                    dataPatients: res.data,
                    isShowLoading: false
                });
            } else {
                toast.error('Không lấy được dữ liệu gói khám');
                this.setState({ isShowLoading: false });
            }
        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Lỗi hệ thống");
            this.setState({ isShowLoading: false });
        }
    };

    handleToggleComment = async (bookingPackageId) => {
        try {
            let res = await toggleIsDisplayedStatusForPackage(bookingPackageId);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật trạng thái bình luận thành công!");
                this.fetchData();
            } else {
                toast.error("Cập nhật thất bại!");
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái!");
            console.error("Toggle comment error:", error);
        }
    };

    handleSearchChange = (event) => {
        this.setState({ searchKeyword: event.target.value });
    };

    toggleDiagnosis = (id) => {
        this.setState(prevState => ({
            expandedDiagnosis: {
                ...prevState.expandedDiagnosis,
                [id]: !prevState.expandedDiagnosis[id]
            }
        }));
    };

    render() {
        const { dataPatients, searchKeyword, expandedDiagnosis } = this.state;
        const { language } = this.props;

        const filtered = dataPatients
            .filter(item => {
                const fullName = `${item.patientData.firstName} ${item.patientData.lastName}`.toLowerCase();
                return fullName.includes(searchKeyword.toLowerCase());
            })
            .sort((a, b) => parseInt(b.date) - parseInt(a.date));

        return (
            <LoadingOverlay active={this.state.isShowLoading} spinner text="Đang tải dữ liệu...">
                <div className="package-patient-container">
                    <h2 className="title">Quản lý bệnh nhân gói khám</h2>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Tìm kiếm theo tên bệnh nhân"
                        value={searchKeyword}
                        onChange={this.handleSearchChange}
                    />
                    <div className="patient-wrapper">
                        {filtered && filtered.length > 0 ? (
                            filtered.map((item, index) => {
                                let formattedDate = moment(parseInt(item.date)).format('DD/MM/YYYY');
                                let timeSlot = language === LANGUAGES.VI ? item?.timeTypeDataPatient?.valueVi : item?.timeTypeDataPatient?.valueEn;
                                let gender = language === LANGUAGES.VI ? item?.patientData?.genderData?.valueVi : item?.patientData?.genderData?.valueEn;
                                let isExpanded = expandedDiagnosis[item.id];

                                return (
                                    <div className="patient-card" key={index}>
                                        <div className="card-header">
                                            <span>{item.patientData.firstName} {item.patientData.lastName}</span>
                                            <span>{formattedDate} - {timeSlot}</span>
                                        </div>
                                        <div className="card-body">
                                            <div><strong>Gói khám:</strong> {item.packageData?.name}</div>
                                            <div><strong>Phòng khám:</strong> {item.packageData?.clinicInfo?.name} - {item.packageData?.clinicInfo?.address}</div>
                                            <div><strong>Giới tính:</strong> {gender}</div>
                                            <div><strong>Email:</strong> {item.patientData.email}</div>
                                            <div><strong>Lý do khám:</strong> {item.reason}</div>
                                            <div><strong>Feedback:</strong> {item.feedback || 'Chưa có'}</div>
                                            <div className="diagnosis-toggle">
                                                <button className="btn btn-outline-primary btn-sm" onClick={() => this.toggleDiagnosis(item.id)}>
                                                    {isExpanded ? 'Ẩn chẩn đoán' : 'Xem chẩn đoán'}
                                                </button>
                                                {isExpanded && (
                                                    <div className="diagnosis-detail">
                                                        <div><strong>Chẩn đoán:</strong> {item.diagnosis}</div>
                                                        {item.remedyImage && (
                                                            <img className="remedy-image" src={item.remedyImage} alt="Remedy" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="card-footer d-flex justify-content-end">
                                            <button
                                                className={`display-btn ${item.isDisplayed ? 'active' : ''}`}
                                                onClick={() => this.handleToggleComment(item.id)}
                                            >
                                                {item.isDisplayed ? 'Bình luận: BẬT' : 'Bình luận: TẮT'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div>Không có dữ liệu</div>
                        )}
                    </div>
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
    user: state.user.userInfo,
});

export default connect(mapStateToProps)(RecordPackage);
