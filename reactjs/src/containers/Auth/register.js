import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as actions from "C:/hoctap/fullStack/reactjs/src/store/actions";
import './Register.scss';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { getAllCodeService } from "C:/hoctap/fullStack/reactjs/src/services/userService";

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
            <div className='user-register-container'>
                <div className='title'>Register</div>
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
                            <label>Password</label>
                            <input className='form-control' type="password"
                                value={password}
                                onChange={(event) => this.onChangeInput(event, "password")}
                            />
                        </div>
                        <div className='col-6'>
                            <label>Confirm Password</label>
                            <input className='form-control' type="password"
                                value={confirmPassword}
                                onChange={(event) => this.onChangeInput(event, "confirmPassword")}
                            />
                        </div>
                        {passwordMismatch && (
                            <div className="col-12 text-danger">
                                Passwords do not match!
                            </div>
                        )}
                        <div className='col-6'>
                            <label>First Name</label>
                            <input className='form-control' type="text"
                                value={firstName}
                                onChange={(event) => this.onChangeInput(event, "firstName")}
                            />
                        </div>
                        <div className='col-6'>
                            <label>Last Name</label>
                            <input className='form-control' type="text"
                                value={lastName}
                                onChange={(event) => this.onChangeInput(event, "lastName")}
                            />
                        </div>
                        <div className='col-6'>
                            <label>Phone Number</label>
                            <input className='form-control' type="text"
                                value={phoneNumber}
                                onChange={(event) => this.onChangeInput(event, "phoneNumber")}
                            />
                        </div>
                        <div className='col-12'>
                            <label>Address</label>
                            <input className='form-control' type="text"
                                value={address}
                                onChange={(event) => this.onChangeInput(event, "address")}
                            />
                        </div>
                        
                        <div className='col-6'>
                            <label>Gender</label>
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
                            <label>Avatar</label>
                            <div className="preview-img-container">
                                <input id='previewImg' type="file" hidden
                                    onChange={(event) => this.handleOnchangeImage(event)}
                                />
                                <label className="label-upload" htmlFor="previewImg">Upload Image <i className="fas fa-upload"></i></label>
                                <div className="preview-image"
                                    style={{ backgroundImage: `url(${previewImgURL})` }}
                                    onClick={() => this.openPreviewImage()}
                                >
                                </div>
                            </div>
                        </div>
                        <div className='col-12 mt-3'>
                            <button className="btn btn-primary"
                                onClick={() => this.handleSaveUser()}>
                                Register
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
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        createNewUser: (data) => dispatch(actions.createNewUser(data))
    };
};

export default withRouter(connect(null, mapDispatchToProps)(Register)); // Wrap component with withRouter
