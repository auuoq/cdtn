// containers/Auth/ResetPassword.js

import React, { Component } from 'react';
import { resetPassword } from '../../services/userService';
import './ResetPassword.scss';

class ResetPassword extends Component {
    state = {
        password: '',
        confirmPassword: '',
        message: '',
        errorMessage: ''
    };

    handleOnChangePassword = (event) => {
        this.setState({ password: event.target.value });
    };

    handleOnChangeConfirmPassword = (event) => {
        this.setState({ confirmPassword: event.target.value });
    };

    handleResetPassword = async () => {
        const { password, confirmPassword } = this.state;
        const token = this.props.match.params.token;

        if (!password || !confirmPassword) {
            this.setState({ errorMessage: 'Vui lòng nhập đầy đủ mật khẩu.' });
            return;
        }

        if (password !== confirmPassword) {
            this.setState({ errorMessage: 'Mật khẩu không khớp.' });
            return;
        }

        try {
            const response = await resetPassword(token, password);
            if (response && response.data.errCode === 0) {
                this.setState({
                    message: 'Mật khẩu của bạn đã được đặt lại thành công.',
                    errorMessage: ''
                });
            } else {
                this.setState({
                    errorMessage: response.data.errMessage || 'Đặt lại mật khẩu thất bại.',
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

    render() {
        return (
            <div className='reset-password-container'>
                <div className='reset-password-content'>
                    <h2>Đặt Lại Mật Khẩu</h2>
                    <div className='form-group'>
                        <label>Mật khẩu mới:</label>
                        <input
                            type='password'
                            className='form-control'
                            value={this.state.password}
                            onChange={this.handleOnChangePassword}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Xác nhận mật khẩu mới:</label>
                        <input
                            type='password'
                            className='form-control'
                            value={this.state.confirmPassword}
                            onChange={this.handleOnChangeConfirmPassword}
                        />
                    </div>
                    {this.state.errorMessage && (
                        <div className='error-message'>{this.state.errorMessage}</div>
                    )}
                    {this.state.message && (
                        <div className='success-message'>{this.state.message}</div>
                    )}
                    <button className='btn btn-primary' onClick={this.handleResetPassword}>
                        Đặt Lại Mật Khẩu
                    </button>
                </div>
            </div>
        );
    }
}

export default ResetPassword;
