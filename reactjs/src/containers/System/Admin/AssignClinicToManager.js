import React, { Component } from 'react';
import { connect } from 'react-redux';
import './AssignClinicToManager.scss';
import { toast } from 'react-toastify';
import { getAllClinic, getAllClinicManager, assignClinicToManager } from '../../../services/userService'; // Đảm bảo bạn đã import từ userService

class AssignClinicToManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinics: [],
            managers: [],
            selectedManager: '',
            selectedClinic: '',
            loading: true
        };
    }

    async componentDidMount() {
        try {
            // Fetch data phòng khám và người quản lý
            const clinicResponse = await getAllClinic();
            const managerResponse = await getAllClinicManager();

            if (clinicResponse.data && clinicResponse.data.length > 0) {
                this.setState({
                    clinics: clinicResponse.data,
                });
            }

            if (managerResponse.data && managerResponse.data.length > 0) {
                this.setState({
                    managers: managerResponse.data,
                    loading: false
                });

            }


        } catch (error) {
            console.error("Error fetching data:", error);
            this.setState({ loading: false });
        }
    }

    // Cập nhật phòng khám dựa trên người quản lý đã chọn
    handleManagerChange = async (e) => {
        const selectedManager = e.target.value;
        this.setState({ selectedManager });

        if (selectedManager) {
            const manager = this.state.managers.find(
                (manager) => manager.id === Number(selectedManager)
            );

            if (
                manager &&
                manager.managedClinics &&
                manager.managedClinics.length > 0 &&
                manager.managedClinics[0].clinicId
            ) {
                const assignedClinic = this.state.clinics.find(
                    (clinic) => clinic.id === manager.managedClinics[0].clinicId
                );
                if (assignedClinic) {
                    this.setState({ selectedClinic: assignedClinic.id });
                } else {
                    this.setState({ selectedClinic: '' });
                }
            } else {
                // Nếu chưa có phòng khám nào được gán
                this.setState({ selectedClinic: '' });
            }
        } else {
            this.setState({ selectedClinic: '' });
        }
    };


    handleSubmit = async () => {
        const { selectedManager, selectedClinic } = this.state;

        if (!selectedManager || !selectedClinic) {
            toast.error("Vui lòng chọn phòng khám và người quản lý!");
            return;
        }

        const data = {
            userId: selectedManager,
            clinicId: selectedClinic
        };

        try {
            const response = await assignClinicToManager(data);
            if (response.errCode === 0) {
                toast.success(response.errMessage); // Thông báo thành công
            } else {
                toast.error(response.errMessage); // Thông báo lỗi
            }
        } catch (error) {
            console.error("Error assigning clinic:", error);
            toast.error("Gán phòng khám thất bại!");
        }
    };

    render() {
        const { clinics, managers, selectedManager, selectedClinic, loading } = this.state;

        return (
            <div className="assign-clinic-container" style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "30px",
                marginTop: "60px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#333",
                    marginBottom: "30px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #eee",
                    fontSize: "24px",
                    fontWeight: "600"
                }}>Gán phòng khám cho người quản lý</div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        <div className="form-group">
                            <label>Chọn người quản lý</label>
                            <select
                                value={selectedManager}
                                onChange={this.handleManagerChange} // Sử dụng hàm handleManagerChange
                                className="form-control"
                            >
                                <option value="">Chọn người quản lý</option>
                                {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.firstName} {manager.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Chọn phòng khám</label>
                            <select
                                value={selectedClinic}
                                onChange={(e) => this.setState({ selectedClinic: e.target.value })}
                                className="form-control"
                            >
                                <option value="">Chọn phòng khám</option>
                                {clinics.map((clinic) => (
                                    <option key={clinic.id} value={clinic.id}>
                                        {clinic.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button onClick={this.handleSubmit} className="btn btn-primary">
                            Gán phòng khám
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userId: state.user.userInfo, // Get userId from redux
    };
};

export default connect(mapStateToProps)(AssignClinicToManager);
