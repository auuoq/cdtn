import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import { handleLoginApi } from '../../services/userService';
import { FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import bg from '../../../src/assets/images/bg.jpg';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isShowPassword: false,
      errMessage: ''
    };
  }

  handleOnChangeUsername = (event) => {
    this.setState({ username: event.target.value });
  }

  handleOnChangePassword = (event) => {
    this.setState({ password: event.target.value });
  }

  handleShowHidePassword = () => {
    this.setState({ isShowPassword: !this.state.isShowPassword });
  }

  handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleLogin();
    }
  }
      handleRedirectToRegister = () => {
        this.props.navigate('/register'); 
    }

    // Handle redirect to forgot password page
    handleRedirectToForgotPassword = () => {
        this.props.navigate('/forgot-password'); 
    }

  handleLogin = async () => {
    this.setState({ errMessage: '' });
    try {
      let data = await handleLoginApi(this.state.username, this.state.password);
      if (data && data.errCode !== 0) {
        this.setState({ errMessage: data.message });
      }
      if (data.errCode === 0) {
        this.props.userLoginSuccess(data.user);
        if (data.user.roleId === "R4") {
          this.props.navigate('/manage/manage-package');
        } 
        else if(data.user.roleId === "R1") {
          this.props.navigate('/system/user-redux');
        }
        else if(data.user.roleId === "R2") {
          this.props.navigate('/doctor/manage-record');
        }
        else {
          this.props.navigate('/home');
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        this.setState({ errMessage: error.response.data.message });
      }
    }
  }

  render() {
    const { username, password, isShowPassword, errMessage } = this.state;

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
        <button
          onClick={() => this.props.navigate('/home')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: '#75d5ca',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          <FaHome />
        </button>

        <div
          className="card shadow"
          style={{ width: '400px', padding: '30px', borderRadius: '10px' }}
        >
          <h4 className="text-center mb-4" style={{ color: '#75d5ca' }}>
            Đăng nhập
          </h4>

          <div className="mb-3">
            <label className="form-label">Tên người dùng</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên người dùng"
              value={username}
              onChange={this.handleOnChangeUsername}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <div className="position-relative">
              <input
                type={isShowPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={this.handleOnChangePassword}
                onKeyDown={this.handleKeyDown}
              />
              <span
                onClick={this.handleShowHidePassword}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#6c757d',
                }}
              >
                {isShowPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          {errMessage && <div className="text-danger mb-3">{errMessage}</div>}

          <button
            className="btn w-100 login-btn"
            style={{
              backgroundColor: '#75d5ca',
              color: 'white'
            }}
            onClick={this.handleLogin}
          >
            Đăng nhập
          </button>

          <div className="text-center mt-3">
              <span className="text-primary" style={{ cursor: 'pointer' }} onClick={this.handleRedirectToForgotPassword}>
                  Quên mật khẩu?
              </span>
          </div>

          <div className="text-center mt-3">
              <span className="text-muted">Bạn chưa có tài khoản? </span>
              <span className="text-primary" style={{ cursor: 'pointer' }} onClick={this.handleRedirectToRegister}>
                  Đăng ký
              </span>
          </div>
          <div
            className="demo-account"
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              maxWidth: "250px",
              zIndex: 1000,
            }}
          >
            <h6 style={{ marginBottom: "8px", color: "#75d5ca" }}>Demo Account</h6>
            <p style={{ margin: 0 }}>- Admin: <b>admin@gmail.com</b><br />PW: 11111111</p>
            <p style={{ margin: 0 }}>- Doctor: <b>doctor1@gmail.com</b><br />PW: 11111111</p>
            <p style={{ margin: 0 }}>- User: <b>datbon1810@gmail.com</b><br />PW: 11111111</p>
            <p style={{ margin: 0 }}>- clinic manager: <b>manager4@gmail.com</b><br />PW: 11111111</p>
          </div>

        </div>
      </div>
    
     

    );
  }
}

const mapStateToProps = state => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    navigate: (path) => dispatch(push(path)),
    userLoginSuccess: (userInfo) => dispatch(actions.userLoginSuccess(userInfo)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
