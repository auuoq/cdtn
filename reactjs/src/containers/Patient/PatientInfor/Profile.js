import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Profile.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import { getUserInfoByEmail, editUserService, getAllCodeService } from '../../../services/userService';
import { withRouter } from 'react-router';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: null,
            loading: true,
            isEditing: false,
            editedData: {},
            genders: [],
        };
    }

    async componentDidMount() {
        const { userInfo } = this.props;

        if (userInfo && userInfo.email) {
            try {
                let response = await getUserInfoByEmail(userInfo.email);
                let genderResponse = await getAllCodeService('GENDER'); // Fetch gender options

                if (response && response.errCode === 0 && genderResponse && genderResponse.errCode === 0) {
                    this.setState({
                        userData: response.data,
                        editedData: { ...response.data },
                        genders: genderResponse.data,
                        loading: false,
                    });
                } else {
                    this.setState({ loading: false });
                }
            } catch (error) {
                console.log('Error fetching user info:', error);
                this.setState({ loading: false });
            }
        }
    }

    handleEdit = () => {
        this.setState({ isEditing: true });
    };

    handleInputChange = (event, field) => {
        let updatedData = { ...this.state.editedData };
        updatedData[field] = event.target.value;
        this.setState({ editedData: updatedData });
    };

    handleSave = async () => {
        const { editedData } = this.state;

        try {
            let response = await editUserService({
                id: this.props.userInfo.id,
                email: editedData.email,
                firstName: editedData.firstName,
                lastName: editedData.lastName,
                address: editedData.address,
                phonenumber: editedData.phonenumber,
                gender: editedData.gender,
                roleId: this.props.userInfo.roleId,
                positionId: this.props.userInfo.positionId,
            });

            if (response && response.errCode === 0) {
                this.setState({
                    userData: editedData,
                    isEditing: false,
                });
                alert('Cập nhật thông tin thành công!');
            } else {
                alert('Cập nhật thất bại!');
            }
        } catch (error) {
            console.log('Error updating user data:', error);
            alert('Đã xảy ra lỗi, vui lòng thử lại sau.');
        }
    };

    handleGenderChange = (event) => {
        let updatedData = { ...this.state.editedData };
        updatedData.gender = event.target.value;
        this.setState({ editedData: updatedData });
    };

    // Navigate to changePassword page
    handleChangePassword = () => {
        this.props.history.push('/changePassword'); // Navigate to the changePassword page
    };

    render() {
        const { userData, loading, isEditing, editedData, genders } = this.state;
        const { language } = this.props; // Lấy ngôn ngữ từ props
    
        if (loading) {
            return <p>Loading...</p>;
        }
    
        if (!userData) {
            return <p>Không tìm thấy thông tin người dùng</p>;
        }
    
        // Lấy giá trị giới tính hiện tại dựa trên keyMap và hiển thị tên
        const currentGender = genders.find(gender => gender.keyMap === userData.gender);
    
        return (
            <>
                <HomeHeader />
                <div className="profile-container">
                    <h1>Thông tin cá nhân</h1>
                    {isEditing ? (
                        <>
                            <p>
                                <strong>Email: </strong>
                                <input
                                    type="email"
                                    value={editedData.email}
                                    onChange={(event) => this.handleInputChange(event, 'email')}
                                />
                            </p>
                            <p>
                                <strong>Họ và tên: </strong>
                                <input
                                    type="text"
                                    value={editedData.firstName}
                                    onChange={(event) => this.handleInputChange(event, 'firstName')}
                                />
                                <input
                                    type="text"
                                    value={editedData.lastName}
                                    onChange={(event) => this.handleInputChange(event, 'lastName')}
                                />
                            </p>
                            <p>
                                <strong>Địa chỉ: </strong>
                                <input
                                    type="text"
                                    value={editedData.address}
                                    onChange={(event) => this.handleInputChange(event, 'address')}
                                />
                            </p>
                            <p>
                                <strong>Giới tính: </strong>
                                <select value={editedData.gender} onChange={this.handleGenderChange}>
                                    {genders.map((gender) => (
                                        <option key={gender.keyMap} value={gender.keyMap}>
                                            {gender.valueVi}
                                        </option>
                                    ))}
                                </select>
                            </p>
                            <p>
                                <strong>Số điện thoại: </strong>
                                <input
                                    type="text"
                                    value={editedData.phonenumber}
                                    onChange={(event) => this.handleInputChange(event, 'phonenumber')}
                                />
                            </p>
                            <button onClick={this.handleSave}>Lưu</button>
                        </>
                    ) : (
                        <>
                            <p><strong>Email: </strong>{userData.email}</p>
                            <p><strong>Họ và tên: </strong>{userData.firstName} {userData.lastName}</p>
                            <p><strong>Địa chỉ: </strong>{userData.address}</p>
                            <p><strong>Giới tính: </strong>{userData.gender}</p>
                            <p><strong>Số điện thoại: </strong>{userData.phonenumber}</p>
                            <button onClick={this.handleEdit}>Sửa thông tin</button>
                            <button onClick={this.handleChangePassword}>Đổi mật khẩu</button>
                        </>
                    )}
                </div>
            </>
        );
    }
}    

const mapStateToProps = (state) => {
    return {
        userInfo: state.user.userInfo, // Thông tin của người dùng đã đăng nhập
    };
};

export default withRouter(connect(mapStateToProps)(Profile)); // Use withRouter HOC
