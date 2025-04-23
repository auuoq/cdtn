import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as actions from "../../store/actions";
import './Register.scss';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { getAllCodeService } from "../../services/userService";
import bg from '../../../src/assets/images/bg.jpg';
class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            avatar: '',
            previewImgURL: '',
            isOpen: false,
            passwordMismatch: false,
            gender: '',  // Lựa chọn giới tính
            genderArr: []  // Mảng chứa danh sách giới tính
        }
    }

    componentDidMount() {
        this.getGenders();
    }

    getGenders = async () => {
        try {
            let response = await getAllCodeService('GENDER');
            if (response && response.errCode === 0) {
                this.setState({
                    genderArr: response.data
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    handleSaveUser = async () => {
        let isValid = this.checkValidateInput();
        if (isValid === false) return;

        if (this.state.password !== this.state.confirmPassword) {
            this.setState({ passwordMismatch: true });
            return;
        }

        this.setState({ passwordMismatch: false });

        try {
            await this.props.createNewUser({
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phonenumber: this.state.phoneNumber,
                avatar: this.state.avatar,
                gender: this.state.gender,
                roleId: 'R3'
            });

            // Redirect to login page after successful registration
        this.props.history.push('/user-login');
        } catch (e) {
            console.error('Error creating new user:', e);
        }
    }

    checkValidateInput = () => {
        let isValid = true;
        let arrCheck = ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'phoneNumber', 'address', 'gender'];
        for (let i = 0; i < arrCheck.length; i++) {
            if (!this.state[arrCheck[i]]) {
                isValid = false;
                alert('This input is required: ' + arrCheck[i]);
                break;
            }
        }
        return isValid;
    }

    onChangeInput = (event, id) => {
        this.setState({
            [id]: event.target.value
        });
    }

    handleOnchangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await this.getBase64(file);
            let objectUrl = URL.createObjectURL(file);
            this.setState({
                previewImgURL: objectUrl,
                avatar: base64
            });
        }
    }

    getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    openPreviewImage = () => {
        if (!this.state.previewImgURL) return;
        this.setState({
            isOpen: true
        });
    }

    render() {
        let { email, password, confirmPassword, firstName, lastName, phoneNumber, address, previewImgURL, passwordMismatch, gender, genderArr } = this.state;

        return (
            <div
                className="d-flex align-items-center justify-content-center"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    height: '100vh',
                    position: 'relative'
                }}
            >
                <div className='user-register-container'>
                <div className='text-center mb-3' 
                    style={{
                        color: '#75d5ca',
                        fontSize: "24px",  
                        fontWeight: 600,   
                        paddingTop: "10px"
                    }}>
                    Đăng ký
                </div>
                    <div className="user-register-body">
                        <div className='row'>
                            <div className='col-6'>
                                <label>Email</label>
                                <input className='form-control' type="email"
                                    value={email}
                                    onChange={(event) => this.onChangeInput(event, "email")}
                                />
                            </div>
                            <div className='col-6'>
                                <label>Mật khẩu</label>
                                <input className='form-control' type="password"
                                    value={password}
                                    onChange={(event) => this.onChangeInput(event, "password")}
                                />
                            </div>
                            <div className='col-6'>
                                <label>Xác nhận mật khẩu</label>
                                <input className='form-control' type="password"
                                    value={confirmPassword}
                                    onChange={(event) => this.onChangeInput(event, "confirmPassword")}
                                />
                            </div>
                            {passwordMismatch && (
                                <div className="col-12 text-danger">
                                    Mật khẩu không khớp!
                                </div>
                            )}
                            <div className='col-6'>
                                <label>Tên</label>
                                <input className='form-control' type="text"
                                    value={firstName}
                                    onChange={(event) => this.onChangeInput(event, "firstName")}
                                />
                            </div>
                            <div className='col-6'>
                                <label>Họ</label>
                                <input className='form-control' type="text"
                                    value={lastName}
                                    onChange={(event) => this.onChangeInput(event, "lastName")}
                                />
                            </div>
                            <div className='col-6'>
                                <label>Số điện thoại</label>
                                <input className='form-control' type="text"
                                    value={phoneNumber}
                                    onChange={(event) => this.onChangeInput(event, "phoneNumber")}
                                />
                            </div>
                            <div className='col-12'>
                                <label>Địa chỉ</label>
                                <input className='form-control' type="text"
                                    value={address}
                                    onChange={(event) => this.onChangeInput(event, "address")}
                                />
                            </div>
                            
                            <div className='col-6'>
                                <label>Giới tính</label>
                                <select className="form-control"
                                    onChange={(event) => this.onChangeInput(event, 'gender')}
                                    value={gender}>
                                    {genderArr && genderArr.length > 0 &&
                                        genderArr.map((item, index) => {
                                            return (
                                                <option key={index} value={item.keyMap}>{item.valueVi}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>

                            <div className='col-12'>
                                <label>Ảnh đại diện</label>
                                <div className="preview-img-container">
                                    <input id='previewImg' type="file" hidden
                                        onChange={(event) => this.handleOnchangeImage(event)}
                                    />
                                    <label className="label-upload" htmlFor="previewImg">Thêm ảnh <i className="fas fa-upload"></i></label>
                                    <div className="preview-image"
                                        style={{ backgroundImage: `url(${previewImgURL})` }}
                                        onClick={() => this.openPreviewImage()}
                                    >
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 mt-3'>
                                <button className="btn w-100"
                                        style={{
                                            backgroundColor: '#75d5ca',
                                            color: 'white'
                                        }}
                                    onClick={() => this.handleSaveUser()}>
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>

                    {this.state.isOpen && 
                        <Lightbox
                            mainSrc={previewImgURL}
                            onCloseRequest={() => this.setState({ isOpen: false })}
                        />
                    }
                </div>
            </div>

        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        createNewUser: (data) => dispatch(actions.createNewUser(data))
    };
};

export default withRouter(connect(null, mapDispatchToProps)(Register)); // Wrap component with withRouter
