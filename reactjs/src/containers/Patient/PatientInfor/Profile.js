import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Profile.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import { getUserInfoByEmail, editUserService, getAllCodeService } from '../../../services/userService';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { toast } from 'react-toastify';


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
                    const userData = userResponse.data;
                    // Format birthDate for display
                    if (userData.birthDate) {
                        userData.formattedBirthDate = this.formatDateForDisplay(userData.birthDate);
                    }
                    
                    this.setState({
                        userData: userData,
                        editedData: { 
                            ...userData,
                            birthDate: userData.birthDate ? this.formatDateForInput(userData.birthDate) : ''
                        },
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
            editedData: { 
                ...this.state.userData,
                birthDate: this.state.userData.birthDate ? this.formatDateForInput(this.state.userData.birthDate) : ''
            }
        });
    };

    handleInputChange = (event, field) => {
        let value = event.target.value;

        this.setState(prevState => ({
            editedData: {
                ...prevState.editedData,
                [field]: value
            }
        }));
    };

    handleSave = async () => {
        const { editedData } = this.state;
        const { userInfo } = this.props;

        this.setState({ isSaving: true });

        try {
            // Convert displayed date back to ISO format before saving
            const birthDateForSave = editedData.birthDate ? 
                this.convertInputDateToISO(editedData.birthDate) : 
                null;

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
                insuranceCode: editedData.insuranceCode,
                idCardNumber: editedData.idCardNumber,
                occupation: editedData.occupation,
                birthDate: birthDateForSave
            });

            if (response?.errCode === 0) {
                const updatedUserData = {
                    ...editedData,
                    birthDate: birthDateForSave,
                    formattedBirthDate: editedData.birthDate
                };
                
                this.setState({
                    userData: updatedUserData,
                    isEditing: false,
                });
                toast.success("Cập nhật thông tin thành công")
            } else {
                toast.error("Cập nhật thông tin thất bại")
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            alert(<FormattedMessage id="profile.update-error" defaultMessage="Đã xảy ra lỗi. Vui lòng thử lại sau." />);
        } finally {
            this.setState({ isSaving: false });
        }
    };

    handleChangePassword = () => {
        this.props.history.push('/changePassword');
    };

    // Format ISO date to display format (dd/mm/yyyy)
    formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${month}/${day}/${year}`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    };

    // Format ISO date to input format (yyyy-mm-dd)
    formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    };

    // Convert input date (yyyy-mm-dd) to ISO format
    convertInputDateToISO = (inputDate) => {
        if (!inputDate) return null;
        
        try {
            const parts = inputDate.split('-');
            if (parts.length !== 3) return null;
            
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            
            const date = new Date(year, month, day);
            if (isNaN(date.getTime())) return null;
            
            return date.toISOString();
        } catch (e) {
            console.error('Error converting date:', e);
            return null;
        }
    };

    // Validate date in dd/mm/yyyy format
    validateDate = (dateString) => {
        if (!dateString) return true;
        
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const parts = dateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        if (year < 1900 || year > new Date().getFullYear()) return false;
        if (month < 1 || month > 12) return false;
        
        const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
            monthLength[1] = 29;
        }
        
        return day > 0 && day <= monthLength[month - 1];
    };

    render() {
        const { userData, loading, isEditing, editedData, genders, isSaving } = this.state;
        const { language } = this.props;

        if (loading) {
            return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            );
        }

        if (!userData) {
            return (
                <div className="error-container">
                    <p>Không tìm thấy thông tin người dùng</p>
                </div>
            );
        }

        const currentGender = genders.find(gender => gender.keyMap === userData.gender);
        const isDateValid = this.validateDate(editedData.birthDate);

        return (
            <>
                <HomeHeader />
                <div className="profile-container">
                    {/* <h1>
                        <div className="info-value">{`${userData.firstName} ${userData.lastName}`}</div>
                    </h1> */}
                    <div className="d-flex align-items-center gap-3 title1">
                        <div
                            className="rounded-circle d-flex justify-content-center align-items-center"
                            style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #0dcaf0, #0d6efd)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            }}
                        >
                            {userData.lastName && userData.lastName[0].toUpperCase()}
                        </div>
                <div style={{
                    marginLeft :"12px"
                }}>
                    <div className="fw-bold text-uppercase">{`${userData.firstName} ${userData.lastName}`}</div>
                    <div className="text-muted">MBN : YBI03HUEKO</div>
                </div>
                </div>
                    
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
                                        placeholder="Họ"
                                        value={editedData.firstName || ''}
                                        onChange={(e) => this.handleInputChange(e, 'firstName')}
                                    />
                                    <input
                                        type="text"
                                        style={{marginLeft: "4px"}}
                                        placeholder="Tên"
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

                        <div className="info-item">
                            <label>
                                Mã bảo hiểm y tế
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.insuranceCode || ''}
                                    onChange={(e) => this.handleInputChange(e, 'insuranceCode')}
                                />
                            ) : (
                                <div className="info-value">{userData.insuranceCode || '-'}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Số CMND/CCCD
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.idCardNumber || ''}
                                    onChange={(e) => this.handleInputChange(e, 'idCardNumber')}
                                />
                            ) : (
                                <div className="info-value">{userData.idCardNumber || '-'}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Nghề nghiệp
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.occupation || ''}
                                    onChange={(e) => this.handleInputChange(e, 'occupation')}
                                />
                            ) : (
                                <div className="info-value">{userData.occupation || '-'}</div>
                            )}
                        </div>

                        <div className="info-item">
                            <label>
                                Ngày sinh
                            </label>
                            {isEditing ? (
                                <>
                                    <input
                                        type="date"
                                        value={editedData.birthDate || ''}
                                        onChange={(e) => this.handleInputChange(e, 'birthDate')}
                                    />
                                    {!isDateValid && editedData.birthDate && (
                                        <span className="text-danger">Ngày không hợp lệ</span>
                                    )}
                                </>
                            ) : (
                                <div className="info-value">
                                    {userData.formattedBirthDate || '-'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="button-group">
                        {isEditing ? (
                            <>
                                <button 
                                    className="save-btn" 
                                    onClick={this.handleSave}
                                    disabled={isSaving || (editedData.birthDate && !isDateValid)}
                                >
                                    {isSaving ? (
                                        <FormattedMessage id="profile.saving" defaultMessage="Đang lưu..." />
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
                                    className="change-password-btn" 
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