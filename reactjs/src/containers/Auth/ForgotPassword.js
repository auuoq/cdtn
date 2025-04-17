import React, { Component } from 'react';
import { sendPasswordResetEmail } from '../../services/userService';
import './ForgotPassword.scss';

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
            console.log('Response:', response);
            if (response && response.errCode === 0) {
                this.setState({
                    message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
                    errorMessage: ''
                });
            } else {
                this.setState({
                    errorMessage: response.data.errMessage || 'Gửi liên kết đặt lại thất bại.',
                    message: ''
                });
            }
        } catch (error) {
            console.log('Error in sendPasswordResetEmail:', error);
            this.setState({
                errorMessage: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
                message: ''
            });
        }
    };
    
    render() {
        return (
            <div className='forgot-password-container'>
                <div className='forgot-password-content'>
                    <h2>Quên Mật Khẩu</h2>
                    <div className='form-group'>
                        <label>Địa chỉ Email:</label>
                        <input
                            type='email'
                            className='form-control'
                            placeholder='Nhập địa chỉ email của bạn'
                            value={this.state.email}
                            onChange={this.handleOnChangeEmail}
                        />
                    </div>
                    {this.state.errorMessage && (
                        <div className='error-message'>{this.state.errorMessage}</div>
                    )}
                    {this.state.message && (
                        <div className='success-message'>{this.state.message}</div>
                    )}
                    <button className='btn btn-primary' onClick={this.handleSendResetLink}>
                        Gửi Liên Kết Đặt Lại
                    </button>
                </div>
            </div>
        );
    }
}

export default ForgotPassword;
