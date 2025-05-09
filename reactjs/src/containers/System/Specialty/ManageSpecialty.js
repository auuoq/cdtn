import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSpecialty.scss'
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils'
import { createNewSpecialty, getAllSpecialty, updateSpecialty, deleteSpecialty } from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageSpecialty extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            
            specialties: [],
            isOpenModal: false,
            isCreateMode: true,
            currentSpecialty: {
                id: '',
                name: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            },
            isOpenDeleteModal: false,
            specialtyToDelete: null
        }
    }

    async componentDidMount() {
        this.fetchSpecialties();
    }

    fetchSpecialties = async () => {
        try {
            let res = await getAllSpecialty();
            if (res && res.errCode === 0) {
                this.setState({
                    specialties: res.data || []
                });
            }
        } catch (e) {
            console.error('Error fetching specialties:', e);
        }
    }

    handleOnChangeInput = (event, id) => {
        let stateCopy = { ...this.state.currentSpecialty };
        stateCopy[id] = event.target.value;
        this.setState({
            currentSpecialty: stateCopy
        })
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            currentSpecialty: {
                ...this.state.currentSpecialty,
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
                currentSpecialty: {
                    ...this.state.currentSpecialty,
                    imageBase64: base64,
                }
            })
        }
    }

    handleOpenCreateModal = () => {
        this.setState({
            isOpenModal: true,
            isCreateMode: true,
            currentSpecialty: {
                id: '',
                name: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            }
        })
    }

    handleOpenEditModal = (specialty) => {
        this.setState({
            isOpenModal: true,
            isCreateMode: false,
            currentSpecialty: {
                ...specialty,
                imageBase64: specialty.image
            }
        });
    }

    handleCloseModal = () => {
        this.setState({
            isOpenModal: false
        });
    }

    handleSaveSpecialty = async () => {
        try {
            let res;
            if (this.state.isCreateMode) {
                res = await createNewSpecialty(this.state.currentSpecialty);
            } else {
                res = await updateSpecialty(this.state.currentSpecialty);
            }

            if (res && res.errCode === 0) {
                toast.success(this.state.isCreateMode ? 'Thêm mới thành công!' : 'Cập nhật thành công!');
                this.handleCloseModal();
                this.fetchSpecialties();
            } else {
                toast.error('Đã xảy ra lỗi...');
            }
        } catch (e) {
            console.error('Error saving specialty:', e);
            toast.error('Đã xảy ra lỗi khi lưu');
        }
    }

    handleDeleteSpecialty = (specialty) => {
        this.setState({
            isOpenDeleteModal: true,
            specialtyToDelete: specialty
        });
    }

    handleCloseDeleteModal = () => {
        this.setState({
            isOpenDeleteModal: false,
            specialtyToDelete: null
        });
    }

    handleConfirmDelete = async () => {
        try {
            let res = await deleteSpecialty(this.state.specialtyToDelete.id);
            if (res && res.errCode === 0) {
                toast.success('Xóa chuyên khoa thành công!');
                this.handleCloseDeleteModal();
                this.fetchSpecialties();
            } else {
                toast.error('Đã xảy ra lỗi khi xóa...');
            }
        } catch (e) {
            console.error('Error deleting specialty:', e);
            toast.error('Đã xảy ra lỗi khi xóa');
        }
    }

    render() {
        let { specialties, currentSpecialty, isCreateMode, specialtyToDelete } = this.state;
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
                    <p style={{
                        fontSize: "24px",
                        fontWeight: "600"
                    }}>Quản lý chuyên khoa</p>
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
                
                {/* Specialty List Table */}
                <div className="mt-3">
                    <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                        <table className="table table-bordered table-hover">
                            <thead  style={{ backgroundColor: "#0379ff", color: "#fff" }}>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên chuyên khoa</th>
                                    <th className='text-center'>Hình ảnh</th>
                                    <th className='text-center'>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {specialties && specialties.length > 0 ?
                                    specialties.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td style={{
                                                display : "flex",
                                                justifyContent: "center"
                                            }}>
                                                {item.image &&
                                                    <img 
                                                        src={item.image} 
                                                        alt="specialty" 
                                                        style={{ width: '80px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                }
                                            </td>
                                            <td>
                                                <div className='action-buttons' style={{
                                                    display: 'flex',
                                                    justifyContent: "center"
                                                }}>
                                                    <button
                                                        onClick={() => this.handleOpenEditModal(item)}
                                                        className="btn-edit"
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => this.handleDeleteSpecialty(item)}
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
                                        <td colSpan="4" className="text-center">Không có dữ liệu</td>
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
                        maxHeight: '95vh',      // Giới hạn chiều cao
                        overflowX: 'hidden',    // Ẩn thanh cuộn ngang ở dialog
                        margin: '1.75rem auto',
                    }}
                    >
                    <div
                        className="modal-content"
                        style={{ overflowX: 'hidden' }}  // Ẩn thanh cuộn ngang ở nội dung
                    >
                        <div className="modal-header">
                        <h5 className="modal-title">
                            {isCreateMode ? 'Thêm mới chuyên khoa' : 'Chỉnh sửa chuyên khoa'}
                        </h5>
                        <button type="button" className="close" onClick={this.handleCloseModal}>
                            <span>&times;</span>
                        </button>
                        </div>
                        <div
                        className="modal-body"
                        style={{ overflowX: 'hidden' }}  // Ẩn thanh cuộn ngang ở body
                        >
                        <div className="row" style={{ overflowX: 'hidden' }}>
                            <div className="col-6 form-group">
                            <label>Tên chuyên khoa</label>
                            <input
                                className="form-control"
                                type="text"
                                value={currentSpecialty.name}
                                onChange={(e) => this.handleOnChangeInput(e, 'name')}
                            />
                            </div>
                            <div className="col-6 form-group">
                            <label>Ảnh chuyên khoa</label>
                            <input
                                className="form-control-file"
                                type="file"
                                onChange={this.handleOnchangeImage}
                            />
                            {currentSpecialty.imageBase64 && (
                                <img
                                src={currentSpecialty.imageBase64}
                                alt="specialty"
                                style={{ width: '100px', height: '60px', objectFit: 'cover', marginTop: '10px' }}
                                />
                            )}
                            </div>
                            <div className='col-12 mt-3' style={{ overflowX: 'hidden' }}>
                            <label>Mô tả chi tiết</label>
                            {/* Wrapper để cuộn riêng cho editor */}
                            <div
                                style={{
                                height: '400px',
                                overflowY: 'auto',    // Cuộn dọc riêng
                                overflowX: 'hidden',  // Ẩn cuộn ngang
                                whiteSpace: 'normal', // Wrap text dài
                                }}
                            >
                                <MdEditor
                                value={currentSpecialty.descriptionMarkdown}
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
                        <button type="button" className="btn btn-primary" onClick={this.handleSaveSpecialty}>
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
                                    <p>Bạn có chắc chắn muốn xóa chuyên khoa <strong>{specialtyToDelete?.name}</strong>?</p>
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

export default connect(mapStateToProps)(ManageSpecialty);