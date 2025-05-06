import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { getAllExamPackages, createExamPackage, updateExamPackage, deleteExamPackage, getAllClinic } from '../../../services/userService';
import './ExamPackage.scss';
import CommonUtils from '../../../utils/CommonUtils';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageExamPackage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            examPackages: [],
            currentExamPackage: {
                id: '',
                name: '',
                categoryId: '',
                clinicId: '',
                price: '',
                provinceId: 'P01',
                paymentId: 'PAY01',
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                image: null,
                note: '',
                imageBase64: ''
            },
            isOpenModal: false,
            isCreateMode: true,
            isOpenDeleteModal: false,
            examPackageToDelete: null,
            // Add dropdown options
            categories: [],
            clinics: [],
            provinces: [],
            paymentMethods: []
        };
    }

    async componentDidMount() {
        this.fetchExamPackages();
        this.fetchClinics()
        // In a real app, you would fetch these from your API
        this.setState({
            categories: [
                { id: 1, name: 'Tổng quát' },
                { id: 2, name: 'Chuyên khoa' }
            ],
            provinces: [
                { id: 'P01', name: 'Hà Nội' },
                { id: 'P02', name: 'TP.HCM' }
            ],
            paymentMethods: [
                { id: 'PAY01', name: 'Tiền mặt' },
                { id: 'PAY02', name: 'Chuyển khoản' }
            ]
        });
    }
    // Thêm hàm fetchClinics
    fetchClinics = async () => {
        try {
            const res = await getAllClinic();
            if (res && res.errCode === 0) {
                this.setState({
                    clinics: res.data || []
                });
            } else {
                toast.error(res?.errMessage || 'Lỗi khi tải danh sách phòng khám');
            }
        } catch (e) {
            console.error('Error fetching clinics:', e);
            toast.error('Lỗi khi tải danh sách phòng khám');
        }
    };

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
            toast.error('Lỗi khi tải danh sách gói khám');
        }
    };

    handleOnChangeInput = (event, id) => {
        let stateCopy = { ...this.state.currentExamPackage };
        stateCopy[id] = event.target.value;
        this.setState({
            currentExamPackage: stateCopy
        });
    };

    handleOnChangeSelect = (selectedOption, fieldName) => {
        this.setState({
            currentExamPackage: {
                ...this.state.currentExamPackage,
                [fieldName]: selectedOption.target.value
            }
        });
    };

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({
                currentExamPackage: {
                    ...this.state.currentExamPackage,
                    imageBase64: base64,
                }
            });
        }
    };

    handleEditorChange = ({ html, text }) => {
        this.setState({
            currentExamPackage: {
                ...this.state.currentExamPackage,
                contentHTML: html,
                contentMarkdown: text
            }
        });
    };

    handleOpenCreateModal = () => {
        this.setState({
            isOpenModal: true,
            isCreateMode: true,
            currentExamPackage: {
                id: '',
                name: '',
                categoryId: '',
                clinicId: '',
                price: '',
                provinceId: 'P01',
                paymentId: 'PAY01',
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                image: null,
                note: '',
                imageBase64: ''
            }
        });
    };

    handleOpenEditModal = (examPackage) => {
        this.setState({
            isOpenModal: true,
            isCreateMode: false,
            currentExamPackage: {
                ...examPackage,
                imageBase64: examPackage.image || ''
            }
        });
    };

    handleCloseModal = () => {
        this.setState({
            isOpenModal: false
        });
    };

    handleSaveExamPackage = async () => {
        try {
            const { currentExamPackage, isCreateMode } = this.state;

            // Validate required fields
            if (!currentExamPackage.name || !currentExamPackage.price || !currentExamPackage.description) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            let res;
            if (isCreateMode) {
                res = await createExamPackage(currentExamPackage);
            } else {
                res = await updateExamPackage(currentExamPackage);
            }

            if (res && res.errCode === 0) {
                toast.success(isCreateMode ? 'Thêm mới gói khám thành công!' : 'Cập nhật gói khám thành công!');
                this.handleCloseModal();
                this.fetchExamPackages();
            } else {
                toast.error(res?.errMessage || 'Đã xảy ra lỗi...');
            }
        } catch (e) {
            console.error('Error saving exam package:', e);
            toast.error('Đã xảy ra lỗi khi lưu');
        }
    };

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
                toast.error(res?.errMessage || 'Đã xảy ra lỗi khi xóa...');
            }
        } catch (e) {
            console.error('Error deleting exam package:', e);
            toast.error('Đã xảy ra lỗi khi xóa');
        }
    };

    render() {
        const {
            examPackages,
            currentExamPackage,
            isCreateMode,
            examPackageToDelete,
            categories,
            clinics,
            provinces,
            paymentMethods
        } = this.state;

        return (
            <div className="manage-exam-package-container">
                <div className="title-container " style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "gray solid 1px",
                    paddingBottom: "8px"
                }}>
                    <h2 style={{
                        fontSize: "24px",
                        fontWeight: "600"
                    }}>Quản lý gói khám</h2>
                    <button
                        className="btn btn-primary"
                        onClick={this.handleOpenCreateModal}
                    >
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                </div>

                <div className="exam-package-table mt-4">
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>STT</th>
                                <th>Tên gói khám</th>
                                <th>Giá</th>
                                <th>Mô tả</th>
                                <th>Ghi chú</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examPackages.length > 0 ? (
                                examPackages.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(item.price)} VND</td>
                                        <td>{item.description}</td>
                                        <td>{item.note || 'Không có'}</td>
                                        <td style={{
                                            display :"flex",
                                            justifyContent:"center"
                                        }}>
                                            <div className='action-buttons'>
                                                <button
                                                    onClick={() => this.handleOpenEditModal(item)}
                                                    className="btn-edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => this.handleDeleteExamPackage(item)}
                                                    className="btn-delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">Không có dữ liệu gói khám</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Modal */}
                {this.state.isOpenModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {isCreateMode ? 'Thêm mới gói khám' : 'Chỉnh sửa gói khám'}
                                </h5>
                                <button type="button" className="close" onClick={this.handleCloseModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Tên gói khám <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentExamPackage.name}
                                        onChange={(event) => this.handleOnChangeInput(event, 'name')}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 form-group">
                                        <label>Giá <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={currentExamPackage.price}
                                            onChange={(event) => this.handleOnChangeInput(event, 'price')}
                                        />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label>Danh mục</label>
                                        <select
                                            className="form-control"
                                            value={currentExamPackage.categoryId}
                                            onChange={(e) => this.handleOnChangeSelect(e, 'categoryId')}
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 form-group">
                                        <label>Phòng khám</label>
                                        <select
                                            className="form-control"
                                            value={currentExamPackage.clinicId}
                                            onChange={(e) => this.handleOnChangeSelect(e, 'clinicId')}
                                        >
                                            <option value="">Chọn phòng khám</option>
                                            {clinics.map((clinic) => (
                                                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label>Tỉnh/Thành phố</label>
                                        <select
                                            className="form-control"
                                            value={currentExamPackage.provinceId}
                                            onChange={(e) => this.handleOnChangeSelect(e, 'provinceId')}
                                        >
                                            {provinces.map((province) => (
                                                <option key={province.id} value={province.id}>{province.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 form-group">
                                        <label>Phương thức thanh toán</label>
                                        <select
                                            className="form-control"
                                            value={currentExamPackage.paymentId}
                                            onChange={(e) => this.handleOnChangeSelect(e, 'paymentId')}
                                        >
                                            {paymentMethods.map((method) => (
                                                <option key={method.id} value={method.id}>{method.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label>Hình ảnh</label>
                                        <input
                                            type="file"
                                            className="form-control-file"
                                            onChange={(event) => this.handleOnChangeImage(event)}
                                        />
                                        {currentExamPackage.imageBase64 && (
                                            <div className="preview-image mt-2">
                                                <img
                                                    src={currentExamPackage.imageBase64}
                                                    alt="Preview"
                                                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mô tả ngắn <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={currentExamPackage.description}
                                        onChange={(event) => this.handleOnChangeInput(event, 'description')}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nội dung chi tiết</label>
                                    <MdEditor
                                        style={{ height: '300px' }}
                                        renderHTML={text => mdParser.render(text)}
                                        onChange={this.handleEditorChange}
                                        value={currentExamPackage.contentMarkdown}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={currentExamPackage.note}
                                        onChange={(event) => this.handleOnChangeInput(event, 'note')}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={this.handleSaveExamPackage}
                                    className="btn btn-primary"
                                >
                                    {isCreateMode ? 'Thêm mới' : 'Cập nhật'}
                                </button>
                                <button
                                    onClick={this.handleCloseModal}
                                    className="btn btn-secondary"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {this.state.isOpenDeleteModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xác nhận xóa</h5>
                                <button type="button" className="close" onClick={this.handleCloseDeleteModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn xóa gói khám <strong>{examPackageToDelete?.name}</strong>?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={this.handleConfirmDelete}
                                    className="btn btn-danger"
                                >
                                    Xóa
                                </button>
                                <button
                                    onClick={this.handleCloseDeleteModal}
                                    className="btn btn-secondary"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default ManageExamPackage;