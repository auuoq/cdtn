import React, { Component } from 'react';
import { sendPasswordResetEmail } from '../../services/userService';
import './ForgotPassword.scss';
import bg from '../../../src/assets/images/bg.jpg'; 
import { FaArrowLeft } from 'react-icons/fa';

class ForgotPassword extends Component {
  state = {
    email: '',
    message: '',
    errorMessage: ''
  };

  handleOnChangeEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  handleSendResetLink = async () => {
    const { email } = this.state;
    if (!email) {
      this.setState({ errorMessage: 'Vui lòng nhập địa chỉ email của bạn.', message: '' });
      return;
    }
    try {
      const response = await sendPasswordResetEmail(email);
      if (response && response.errCode === 0) {
        this.setState({
          message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
          errorMessage: ''
        });
      } else {
        this.setState({
          errorMessage: response?.data?.errMessage || 'Gửi liên kết đặt lại thất bại.',
          message: ''
        });
      }
    } catch (error) {
      this.setState({
        errorMessage: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        message: ''
      });
    }
  };

  handleGoBack = () => {
    this.props.history.push('/user-login');
  }

  render() {
    const { email, message, errorMessage } = this.state;

    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url(${bg})`,
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
            Quên mật khẩu
          </h4>

          <div className="mb-3">
            <label className="form-label">Địa chỉ Email:</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập địa chỉ email của bạn"
              value={email}
              onChange={this.handleOnChangeEmail}
            />
          </div>

          {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}
          {message && <div className="text-success mb-3">{message}</div>}

          <button
            className="btn w-100"
            style={{
              backgroundColor: '#75d5ca',
              color: 'white'
            }}
            onClick={this.handleSendResetLink}
          >
            Gửi liên kết đặt lại
          </button>

          <div
            onClick={this.handleGoBack}
            style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#75d5ca',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaArrowLeft /> Quay lại đăng nhập
          </div>
        </div>
      </div>
    );
  }
}

export default ForgotPassword;
