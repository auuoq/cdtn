import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import { handleLoginApi } from '../../services/userService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import bg from '../../asset/bg.jpg'; // Cập nhật đường dẫn nếu khác

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

  handleLogin = async () => {
    this.setState({ errMessage: '' });
    try {
      let data = await handleLoginApi(this.state.username, this.state.password);
      if (data && data.errCode !== 0) {
        this.setState({ errMessage: data.message });
      }
      if (data && data.errCode === 0) {
        this.props.userLoginSuccess(data.user);
        this.props.navigate('/system/user-redux');
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
        //   backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100vh',
        }}
      >
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
            className="btn w-100"
            style={{
              backgroundColor: '#75d5ca',
              color: 'white'
            }}
            onClick={this.handleLogin}
          >
            Đăng nhập
          </button>
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