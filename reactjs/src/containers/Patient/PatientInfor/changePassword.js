import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ChangePassword.scss';
import { changePassword } from '../../../services/userService';
import HomeHeader from '../../HomePage/HomeHeader';

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPassword: '',  // To store the current password
            newPassword: '',      // To store the new password
            confirmNewPassword: '' // To confirm the new password
        };
    }

    handlePasswordChange = async () => {
        const { currentPassword, newPassword, confirmNewPassword } = this.state;

        // Validate the new password
        if (newPassword !== confirmNewPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        try {
            let response = await changePassword({
                userId: this.props.userInfo.id, // Assuming the user ID is available in userInfo
                currentPassword,
                newPassword,
            });

            if (response && response.errCode === 0) {
                alert('Đổi mật khẩu thành công!');
                this.setState({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                });
            } else {
                alert(response.errMessage || 'Đổi mật khẩu thất bại.');
            }
        } catch (error) {
            console.log('Error updating password:', error);
            alert('Đã xảy ra lỗi, vui lòng thử lại.');
        }
    };

    render() {
        const { currentPassword, newPassword, confirmNewPassword } = this.state;

        return (
            <>
                <HomeHeader />
                <div className="change-password-container">
                    <h1>Đổi Mật Khẩu</h1>
                    <div className="password-change-form">
                        <div className="form-group">
                            <label>Mật khẩu hiện tại:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => this.setState({ currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu mới:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => this.setState({ newPassword: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Xác nhận mật khẩu mới:</label>
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => this.setState({ confirmNewPassword: e.target.value })}
                            />
                        </div>
                        <button onClick={this.handlePasswordChange}>Đổi mật khẩu</button>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.user.userInfo,
    };
};

export default connect(mapStateToProps)(ChangePassword);
