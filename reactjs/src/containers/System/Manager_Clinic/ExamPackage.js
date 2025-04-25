import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { getAllExamPackages, createExamPackage, updateExamPackage, deleteExamPackage } from '../../../services/userService'; // Đảm bảo bạn đã import đúng API
import './ExamPackage.scss';
import CommonUtils from '../../../utils/CommonUtils'; // Ensure the correct path to CommonUtils

class ManageExamPackage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            examPackages: [],
            currentExamPackage: {
                id: '',
                name: '',
                price: '',
                description: '',
                imageBase64: '',
                // thêm các thuộc tính cần thiết cho gói khám
            },
            isOpenModal: false,
            isCreateMode: true,
            isOpenDeleteModal: false,
            examPackageToDelete: null
        };
    }

    async componentDidMount() {
        this.fetchExamPackages();
    }

    fetchExamPackages = async () => {
        try {
            const res = await getAllExamPackages();
            if (res && res.errCode === 0) {
                this.setState({
                    examPackages: res.data || []
                });
            }
        } catch (e) {
            console.error('Error fetching exam packages:', e);
        }
    };

    handleOnChangeInput = (event, id) => {
        let stateCopy = { ...this.state.currentExamPackage };
        stateCopy[id] = event.target.value;
        this.setState({
            currentExamPackage: stateCopy
        });
    };

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file); // Dùng hàm getBase64 từ utils để chuyển file ảnh thành base64
            this.setState({
                currentExamPackage: {
                    ...this.state.currentExamPackage,
                    imageBase64: base64,
                }
            });
        }
    };

    handleOpenCreateModal = () => {
        this.setState({
            isOpenModal: true,
            isCreateMode: true,
            currentExamPackage: {
                id: '',
                name: '',
                price: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            }
        });
    };

    handleOpenEditModal = (examPackage) => {
        this.setState({
            isOpenModal: true,
            isCreateMode: false,
            currentExamPackage: { ...examPackage }
        });
    };

    handleCloseModal = () => {
        this.setState({
            isOpenModal: false
        });
    };

    handleSaveExamPackage = async () => {
        try {
            let res;
            if (this.state.isCreateMode) {
                res = await createExamPackage(this.state.currentExamPackage);
            } else {
                res = await updateExamPackage(this.state.currentExamPackage);
            }

            if (res && res.errCode === 0) {
                toast.success(this.state.isCreateMode ? 'Thêm mới gói khám thành công!' : 'Cập nhật gói khám thành công!');
                this.handleCloseModal();
                this.fetchExamPackages();
            } else {
                toast.error('Đã xảy ra lỗi...');
            }
        } catch (e) {
            console.error('Error saving exam package:', e);
            toast.error('Đã xảy ra lỗi khi lưu');
        }
    };

    // Xử lý xóa gói khám
    handleDeleteExamPackage = (examPackage) => {
        this.setState({
            isOpenDeleteModal: true,
            examPackageToDelete: examPackage
        });
    };

    handleCloseDeleteModal = () => {
        this.setState({
            isOpenDeleteModal: false,
            examPackageToDelete: null
        });
    };

    handleConfirmDelete = async () => {
        try {
            let res = await deleteExamPackage(this.state.examPackageToDelete.id);
            if (res && res.errCode === 0) {
                toast.success('Xóa gói khám thành công!');
                this.handleCloseDeleteModal();
                this.fetchExamPackages();
            } else {
                toast.error('Đã xảy ra lỗi khi xóa...');
            }
        } catch (e) {
            console.error('Error deleting exam package:', e);
            toast.error('Đã xảy ra lỗi khi xóa');
        }
    };

    render() {
        let { examPackages, currentExamPackage, isCreateMode, examPackageToDelete } = this.state;

        return (
            <div className="managa-specialty-container" style={{
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
                }}>
                    <p  style={{
                        fontSize : "24px",
                        fontWeight: "600"
                    }}>Quản lý gói khám</p>
                    <div>
                        <button 
                            className="btn btn-primary"
                            onClick={this.handleOpenCreateModal}
                            style={{ fontSize: "14px", fontWeight: "normal" }}
                        >
                            <i className="fas fa-plus"></i> Thêm mới 
                        </button>

                    </div>
                </div>

                {/* Gói khám list table */}
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên gói khám</th>
                            <th>Giá</th>
                            <th>Mô tả</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examPackages && examPackages.length > 0 ? examPackages.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                                <td>{item.description}</td>
                                <td>
                                    <button onClick={() => this.handleOpenEditModal(item)} className="btn btn-warning">
                                        Sửa
                                    </button>
                                    <button onClick={() => this.handleDeleteExamPackage(item)} className="btn btn-danger">
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Modal cho thêm và sửa gói khám */}
                {this.state.isOpenModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h5>{isCreateMode ? 'Thêm mới gói khám' : 'Chỉnh sửa gói khám'}</h5>
                            <label>Tên gói khám:</label>
                            <input
                                type="text"
                                value={currentExamPackage.name}
                                onChange={(event) => this.handleOnChangeInput(event, 'name')}
                            />
                            <label>Giá:</label>
                            <input
                                type="number"
                                value={currentExamPackage.price}
                                onChange={(event) => this.handleOnChangeInput(event, 'price')}
                            />
                            <label>Mô tả:</label>
                            <textarea
                                value={currentExamPackage.description}
                                onChange={(event) => this.handleOnChangeInput(event, 'description')}
                            />
                            <button onClick={this.handleSaveExamPackage} className="btn btn-primary">
                                Lưu
                            </button>
                            <button onClick={this.handleCloseModal} className="btn btn-secondary">
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal xác nhận xóa */}
                {this.state.isOpenDeleteModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h5>Xác nhận xóa</h5>
                            <p>Bạn có chắc chắn muốn xóa gói khám <strong>{examPackageToDelete?.name}</strong>?</p>
                            <button onClick={this.handleConfirmDelete} className="btn btn-danger">
                                Xóa
                            </button>
                            <button onClick={this.handleCloseDeleteModal} className="btn btn-secondary">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default ManageExamPackage;
