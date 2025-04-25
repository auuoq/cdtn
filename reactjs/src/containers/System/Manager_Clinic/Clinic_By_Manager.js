import React, { Component } from 'react';
import { connect } from "react-redux";
import './Clinic_By_Manager.scss';
import { getClinicByManager, updateClinic } from '../../../services/userService'; // Thêm API update phòng khám
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt();

class Clinic_By_Manager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicId: '', // ID của phòng khám
            name: '',
            address: '',
            imageBase64: '',
            imageUrl: '',  // Dùng để lưu trữ đường dẫn URL ảnh (dành cho hiển thị)
            descriptionHTML: '',
            descriptionMarkdown: '',
            loading: true, // Để hiển thị loading trong khi lấy dữ liệu
        }
    }

    async componentDidMount() {
        const { userId } = this.props; // Lấy userId từ props (có thể lấy từ redux hoặc props)
        let res = await getClinicByManager(userId.id);

        if (res && res.errCode === 0) {
            const clinicData = res.data;
            this.setState({
                clinicId: clinicData.id,
                name: clinicData.name,
                address: clinicData.address,
                descriptionHTML: clinicData.descriptionHTML,
                descriptionMarkdown: clinicData.descriptionMarkdown,
                imageUrl: clinicData.image, // Lưu trữ ảnh phòng khám hiện tại
                loading: false
            });
        } else {
            toast.error('Failed to fetch clinic data!');
            this.setState({ loading: false });
        }
    }

    handleOnChangeInput = (event, id) => {
        this.setState({
            [id]: event.target.value
        });
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionHTML: html,
            descriptionMarkdown: text,
        });
    }

    handleOnchangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({
                imageBase64: base64,  // Cập nhật ảnh base64 khi người dùng chọn tệp mới
                imageUrl: URL.createObjectURL(file) // Cập nhật URL của ảnh được chọn
            });
        }
    }

    handleSaveNewClinic = async () => {
        const { clinicId, name, address, descriptionHTML, descriptionMarkdown, imageBase64 } = this.state;

        const clinicData = {
            id: clinicId,
            name,
            address,
            descriptionHTML,
            descriptionMarkdown,
            imageBase64,
        };

        let res = await updateClinic(clinicData);

        if (res && res.errCode === 0) {
            toast.success('Clinic information updated successfully!');
        } else {
            toast.error('Failed to update clinic information!');
        }
    }

    render() {
        const { name, address, descriptionMarkdown, loading, imageUrl } = this.state;

        return (
            <div className="clinic-by-manager-container">
                <div className="ms-title">Quản lý phòng khám</div>

                {loading ? <div>Loading...</div> : (
                    <div className="add-new-clinic row">
                        <div className='col-6 form-group'>
                            <label>Tên phòng khám</label>
                            <input className="form-control" type="text" value={name}
                                onChange={(event) => this.handleOnChangeInput(event, 'name')}
                            />
                        </div>
                        <div className='col-6 form-group'>
                            <label>Ảnh phòng khám</label>
                            {/* Hiển thị ảnh nếu đã có */}
                            <input className="form-control-file" type="file"
                                onChange={(event) => this.handleOnchangeImage(event)}
                            />
                            {imageUrl && (
                                <div className="preview-image-container">
                                    <img
                                        src={imageUrl}
                                        alt="clinic"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            marginTop: '10px'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="col-6 form-group">
                            <label>Địa chỉ phòng khám</label>
                            <input className="form-control" type="text" value={address}
                                onChange={(event) => this.handleOnChangeInput(event, 'address')}
                            />
                        </div>

                        <div className='col-12'>
                            <MdEditor
                                style={{ height: '300px' }}
                                renderHTML={text => mdParser.render(text)}
                                onChange={this.handleEditorChange}
                                value={descriptionMarkdown}
                            />
                        </div>

                        <div className="col-12">
                            <button className="btn-save-clinic"
                                onClick={() => this.handleSaveNewClinic()}
                            >
                                Save
                            </button>
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
        userId: state.user.userInfo, // Lấy userId từ Redux
    };
};

const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Clinic_By_Manager);
