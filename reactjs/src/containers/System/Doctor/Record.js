import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManagePatient.scss';
import { getAllPatientsWithStatusS3 } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import moment from 'moment';

class ManagePatient extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataPatient: [],
            isShowLoading: false
        }
    }

    async componentDidMount() {
        this.getDataPatient();
    }

    getDataPatient = async () => {
        let { user } = this.props;
        this.setState({ isShowLoading: true });
        try {
            let res = await getAllPatientsWithStatusS3({
                doctorId: user.id
            });
            if (res && res.errCode === 0) {
                this.setState({
                    dataPatient: res.data,
                    isShowLoading: false
                });
            } else {
                this.setState({ isShowLoading: false });
                toast.error('Lỗi khi lấy dữ liệu bệnh nhân.');
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({ isShowLoading: false });
        }
    }

    render() {
        let { dataPatient } = this.state;
        let { language } = this.props;

        return (
            <LoadingOverlay
                active={this.state.isShowLoading}
                spinner
                text="Đang tải dữ liệu..."
            >
                <div  style={
                   {
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "30px",
                    marginTop: "60px",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }
                }>
                    <h2 className="text-left mb-4" style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "30px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #eee",
                }
                    }>Quản lý bệnh nhân đã khám</h2>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered align-middle">
                            <thead className="">
                                <tr>
                                    <th>#</th>
                                    <th>Ngày khám</th>
                                    <th>Họ và tên</th>
                                    <th>Địa chỉ</th>
                                    <th>Giới tính</th>
                                    <th>Lý do khám</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataPatient && dataPatient.length > 0 ? (
                                    dataPatient.map((item, index) => {
                                        let formattedDate = moment(parseInt(item.date)).format('DD/MM/YYYY');
                                        let timeSlot = language === LANGUAGES.VI ?
                                            item?.timeTypeDataPatient?.valueVi : item?.timeTypeDataPatient?.valueEn;
                                        let gender = language === LANGUAGES.VI ?
                                            item?.patientData?.genderData?.valueVi : item?.patientData?.genderData?.valueEn;

                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{formattedDate} {timeSlot}</td>
                                                <td>{item.patientData.firstName} {item.patientData.lastName}</td>
                                                <td>{item.patientData.address}</td>
                                                <td>{gender}</td>
                                                <td>{item.reason}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        user: state.user.userInfo,
    };
};

export default connect(mapStateToProps)(ManagePatient);
