import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Profile.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import { getUserInfoByEmail, editUserService, getAllCodeService } from '../../../services/userService';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl'; // For internationalization

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: null,
            loading: true,
            isEditing: false,
            editedData: {},
            genders: [],
            isSaving: false
        };
    }

    async componentDidMount() {
        const { userInfo } = this.props;

        if (userInfo && userInfo.email) {
            try {
                let [userResponse, genderResponse] = await Promise.all([
                    getUserInfoByEmail(userInfo.email),
                    getAllCodeService('GENDER')
                ]);

                if (userResponse?.errCode === 0 && genderResponse?.errCode === 0) {
                    this.setState({
                        userData: userResponse.data,
                        editedData: { ...userResponse.data },
                        genders: genderResponse.data,
                        loading: false,
                    });
                } else {
                    this.setState({ loading: false });
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                this.setState({ loading: false });
            }
        }
    }

    handleEdit = () => {
        this.setState({ isEditing: true });
    };

    handleCancel = () => {
        this.setState({ 
            isEditing: false,
            editedData: { ...this.state.userData }
        });
    };

    handleInputChange = (event, field) => {
        this.setState(prevState => ({
            editedData: {
                ...prevState.editedData,
                [field]: event.target.value
            }
        }));
    };

    handleSave = async () => {
        const { editedData } = this.state;
        const { userInfo } = this.props;

        this.setState({ isSaving: true });

        try {
            let response = await editUserService({
                id: userInfo.id,
                email: editedData.email,
                firstName: editedData.firstName,
                lastName: editedData.lastName,
                address: editedData.address,
                phonenumber: editedData.phonenumber,
                gender: editedData.gender,
                roleId: userInfo.roleId,
                positionId: userInfo.positionId,
            });

            if (response?.errCode === 0) {
                this.setState({
                    userData: editedData,
                    isEditing: false,
                });
                alert(<FormattedMessage id="profile.update-success" defaultMessage="Profile updated successfully!" />);
            } else {
                alert(<FormattedMessage id="profile.update-failed" defaultMessage="Update failed. Please try again." />);
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            alert(<FormattedMessage id="profile.update-error" defaultMessage="An error occurred. Please try again later." />);
        } finally {
            this.setState({ isSaving: false });
        }
    };

    handleChangePassword = () => {
        this.props.history.push('/changePassword');
    };

    render() {
        const { userData, loading, isEditing, editedData, genders, isSaving } = this.state;
        const { language } = this.props;

        if (loading) {
            return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            );
        }

        if (!userData) {
            return (
                <div className="error-container">
                    <p>User information not found</p>
                </div>
            );
        }

        const currentGender = genders.find(gender => gender.keyMap === userData.gender);

        return (
            <>
                <HomeHeader />
                <div className="profile-container">
                    <h1>
                        Thông tin cá nhân
                    </h1>
                    
                    <div className="profile-info">
                        <div className="info-item">
                            <label>
                                <FormattedMessage id="profile.email" defaultMessage="Email" />
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editedData.email || ''}
                                    onChange={(e) => this.handleInputChange(e, 'email')}
                                />
                            ) : (
                                <div className="info-value">{userData.email}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Họ và tên
                            </label>
                            {isEditing ? (
                                <div className="name-inputs">
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={editedData.firstName || ''}
                                        onChange={(e) => this.handleInputChange(e, 'firstName')}
                                    />
                                    <input
                                        type="text"
                                        style={{marginLeft : "4px"}}
                                        placeholder="Last name"
                                        value={editedData.lastName || ''}
                                        onChange={(e) => this.handleInputChange(e, 'lastName')}
                                    />
                                </div>
                            ) : (
                                <div className="info-value">{`${userData.firstName} ${userData.lastName}`}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Địa chỉ
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.address || ''}
                                    onChange={(e) => this.handleInputChange(e, 'address')}
                                />
                            ) : (
                                <div className="info-value">{userData.address || '-'}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Giới tính
                            </label>
                            {isEditing ? (
                                <select 
                                    value={editedData.gender || ''} 
                                    onChange={(e) => this.handleInputChange(e, 'gender')}
                                >
                                    {genders.map((gender) => (
                                        <option key={gender.keyMap} value={gender.keyMap}>
                                            {language === 'vi' ? gender.valueVi : gender.valueEn}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="info-value">
                                    {currentGender ? (language === 'vi' ? currentGender.valueVi : currentGender.valueEn) : userData.gender}
                                </div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Số điện thoại
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.phonenumber || ''}
                                    onChange={(e) => this.handleInputChange(e, 'phonenumber')}
                                />
                            ) : (
                                <div className="info-value">{userData.phonenumber || '-'}</div>
                            )}
                        </div>
                    </div>

                    <div className="button-group">
                        {isEditing ? (
                            <>
                                <button 
                                    className="save-btn" 
                                    onClick={this.handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <FormattedMessage id="profile.saving" defaultMessage="Đang lưu" />
                                    ) : (
                                        <FormattedMessage id="profile.save" defaultMessage="Lưu" />
                                    )}
                                </button>
                                <button 
                                    className="edit-btn" 
                                    onClick={this.handleCancel}
                                    disabled={isSaving}
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className="edit-btn" 
                                    onClick={this.handleEdit}
                                >
                                    <FormattedMessage id="profile.edit" defaultMessage="Sửa" />
                                </button>
                                <button 
                                    className="change-password-btn " 
                                    onClick={this.handleChangePassword}
                                >
                                    <FormattedMessage id="profile.change-password" defaultMessage="Đổi mật khẩu" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.user.userInfo,
    language: state.app.language,
});

export default withRouter(connect(mapStateToProps)(Profile));