import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageClinic.scss'
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils'
import { createNewClinic, getAllClinic, updateClinic, deleteClinic } from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageClinic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            
            clinics: [],
            isOpenModal: false,
            isCreateMode: true,
            currentClinic: {
                id: '',
                name: '',
                address: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            },
            // Thêm state cho modal xác nhận xóa
            isOpenDeleteModal: false,
            clinicToDelete: null,
            searchKeyword: ''
        }
    }

    async componentDidMount() {
        this.fetchClinics();
    }

    fetchClinics = async () => {
        try {
            let res = await getAllClinic();
            if (res && res.errCode === 0) {
                this.setState({
                    clinics: res.data || []
                });
            }
        } catch (e) {
            console.error('Error fetching clinics:', e);
        }
    }

    handleOnChangeInput = (event, id) => {
        let stateCopy = { ...this.state.currentClinic };
        stateCopy[id] = event.target.value;
        this.setState({
            currentClinic: stateCopy
        })
    }
    handleSearchChange = (event) => {
        this.setState({ searchKeyword: event.target.value });
    }
    handleEditorChange = ({ html, text }) => {
        this.setState({
            currentClinic: {
                ...this.state.currentClinic,
                descriptionHTML: html,
                descriptionMarkdown: text,
            }
        })
    }

    handleOnchangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({
                currentClinic: {
                    ...this.state.currentClinic,
                    imageBase64: base64,
                }
            })
        }
    }

    handleOpenCreateModal = () => {
        this.setState({
            isOpenModal: true,
            isCreateMode: true,
            currentClinic: {
                id: '',
                name: '',
                address: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            }
        })
    }

    handleOpenEditModal = (clinic) => {
        this.setState({
            isOpenModal: true,
            isCreateMode: false,
            currentClinic: {
                ...clinic,
                imageBase64: clinic.image
            }
        });
    }

    handleCloseModal = () => {
        this.setState({
            isOpenModal: false
        });
    }

    handleSaveClinic = async () => {
        try {
            let res;
            if (this.state.isCreateMode) {
                res = await createNewClinic(this.state.currentClinic);
            } else {
                res = await updateClinic(this.state.currentClinic);
            }

            if (res && res.errCode === 0) {
                toast.success(this.state.isCreateMode ? 'Thêm mới thành công!' : 'Cập nhật thành công!');
                this.handleCloseModal();
                this.fetchClinics();
            } else {
                toast.error('Đã xảy ra lỗi...');
            }
        } catch (e) {
            console.error('Error saving clinic:', e);
            toast.error('Đã xảy ra lỗi khi lưu');
        }
    }

    // Xử lý xóa phòng khám
    handleDeleteClinic = (clinic) => {
        this.setState({
            isOpenDeleteModal: true,
            clinicToDelete: clinic
        });
    }

    handleCloseDeleteModal = () => {
        this.setState({
            isOpenDeleteModal: false,
            clinicToDelete: null
        });
    }

    handleConfirmDelete = async () => {
        try {
            let res = await deleteClinic(this.state.clinicToDelete.id);
            if (res && res.errCode === 0) {
                toast.success('Xóa phòng khám thành công!');
                this.handleCloseDeleteModal();
                this.fetchClinics();
            } else {
                toast.error('Đã xảy ra lỗi khi xóa...');
            }
        } catch (e) {
            console.error('Error deleting clinic:', e);
            toast.error('Đã xảy ra lỗi khi xóa');
        }
    }

    render() {
        let { clinics, currentClinic, isCreateMode, clinicToDelete } = this.state;
        let filteredClinics = clinics.filter(clinic =>
            clinic.name.toLowerCase().includes(this.state.searchKeyword.toLowerCase())
        );
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
                    }}>Quản lý phòng khám</p>
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
                <div className="search-bar">
                <div className="search-input-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên phòng khám..."
                    value={this.state.searchKeyword}
                    onChange={this.handleSearchChange}
                    />
                </div>
                </div>


                
                {/* Clinic List Table */}
                <div className="mt-3">
                    <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                        <table className="table table-bordered table-hover">
                            <thead  style={{ backgroundColor: "#0379ff", color: "#fff" }}>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên phòng khám</th>
                                    <th>Địa chỉ</th>
                                    <th>Hình ảnh</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClinics && filteredClinics.length > 0 ?
                                    filteredClinics.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.address}</td>
                                            <td>
                                                {item.image &&
                                                    <img 
                                                        src={item.image} 
                                                        alt="clinic" 
                                                        style={{ width: '80px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                }
                                            </td>
                                            <td>
                                                <div className='action-buttons'>
                                                    <button
                                                        onClick={() => this.handleOpenEditModal(item)}
                                                        className="btn-edit"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => this.handleDeleteClinic(item)}
                                                        className="btn-delete"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr>
                                        <td colSpan="5" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal chung cho cả thêm mới và chỉnh sửa */}
                {this.state.isOpenModal && (
                <div
                    className="modal"
                    style={{
                    display: 'block',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1050,
                    }}
                >
                    <div
                    className="modal-dialog modal-lg modal-dialog-scrollable"
                    style={{
                            // rộng 90% viewport width
                        maxHeight: '95vh',     // cao tối đa 95% viewport height
                        margin: '1.75rem auto',
                        overflowX: 'hidden',   // ẩn thanh cuộn ngang
                    }}
                    >
                    <div
                        className="modal-content"
                        style={{ overflowX: 'hidden' }}  // ẩn thanh cuộn ngang nội dung
                    >
                        <div className="modal-header">
                        <h5 className="modal-title">
                            {isCreateMode ? 'Thêm mới phòng khám' : 'Chỉnh sửa phòng khám'}
                        </h5>
                        <button type="button" className="close" onClick={this.handleCloseModal}>
                            <span>&times;</span>
                        </button>
                        </div>
                        <div className="modal-body" style={{ overflowX: 'hidden' }}>
                        <div className="row" style={{ overflowX: 'hidden' }}>
                            <div className="col-6 form-group">
                            <label>Tên phòng khám</label>
                            <input
                                className="form-control"
                                type="text"
                                value={currentClinic.name}
                                onChange={(e) => this.handleOnChangeInput(e, 'name')}
                            />
                            </div>
                            <div className="col-6 form-group">
                            <label>Ảnh phòng khám</label>
                            <input
                                className="form-control-file"
                                type="file"
                                onChange={this.handleOnchangeImage}
                            />
                            {currentClinic.imageBase64 && (
                                <img
                                src={currentClinic.imageBase64}
                                alt="clinic"
                                style={{ width: '100px', height: '60px', objectFit: 'cover', marginTop: '10px' }}
                                />
                            )}
                            </div>
                            <div className="col-6 form-group">
                            <label>Địa chỉ phòng khám</label>
                            <input
                                className="form-control"
                                type="text"
                                value={currentClinic.address}
                                onChange={(e) => this.handleOnChangeInput(e, 'address')}
                            />
                            </div>
                            <div className="col-12 mt-3" style={{ overflowX: 'hidden' }}>
                            <label>Mô tả chi tiết</label>
                            <div
                                style={{
                                height: '300px',
                                overflowY: 'auto',    // cuộn dọc riêng
                                overflowX: 'hidden',  // ẩn cuộn ngang
                                whiteSpace: 'normal', // wrap text dài
                                }}
                            >
                                <MdEditor
                                value={currentClinic.descriptionMarkdown}
                                renderHTML={(text) => mdParser.render(text)}
                                onChange={this.handleEditorChange}
                                style={{ height: '100%' }}
                                />
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={this.handleCloseModal}>
                            Đóng
                        </button>
                        <button type="button" className="btn btn-primary" onClick={this.handleSaveClinic}>
                            {isCreateMode ? 'Thêm mới' : 'Lưu thay đổi'}
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                )}


                {/* Modal xác nhận xóa */}
                {this.state.isOpenDeleteModal && (
                    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
                        <div className="modal-dialog" style={{ maxWidth: '500px', margin: '1.75rem auto' }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Xác nhận xóa</h5>
                                    <button type="button" className="close" onClick={this.handleCloseDeleteModal}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p>Bạn có chắc chắn muốn xóa phòng khám <strong>{clinicToDelete?.name}</strong>?</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.handleCloseDeleteModal}>
                                        Hủy
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={this.handleConfirmDelete}>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

export default connect(mapStateToProps)(ManageClinic);