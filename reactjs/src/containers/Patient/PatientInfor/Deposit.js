import React, { Component } from 'react';
import { connect } from "react-redux";
import './Deposit.scss';
import { getDepositInfo, postVerifyBookAppointment } from '../../../services/userService';
import HomeHeader from '../../HomePage/HomeHeader';

class Deposit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            appointmentId: null, // Lưu appointmentId lấy từ URL
            depositAmount: '', // Số tiền đặt cọc
            depositInfo: null, // Dữ liệu đặt cọc từ API
            loading: true, // Trạng thái tải dữ liệu
            error: null, // Lưu lỗi nếu có
            successMessage: '', // Lưu thông báo thành công
        };
    }

    async componentDidMount() {
        // Lấy appointmentId từ URL params
        const { appointmentId } = this.props.match.params;
        this.setState({ appointmentId });

        try {
            let response = await getDepositInfo(appointmentId);
            if (response && response.data.errCode === 0) {
                const depositInfo = response.data.data[0]; // Lấy phần tử đầu tiên của mảng data
                let price = parseFloat(depositInfo.doctorBooking.priceTypeData.valueVi.replace(/,/g, '')); // Chuyển giá thành số

                // Check if timeType is T9, T10, T11, T12, or T13, increase price by 50%
                if (['T9', 'T10', 'T11', 'T12', 'T13'].includes(depositInfo.timeType)) {
                    price = price * 1.5; // Increase price by 50%
                }

                const depositAmount = (price / 2).toFixed(0); // Tính số tiền cọc (50%)

                this.setState({ 
                    depositInfo,
                    depositAmount,
                    adjustedPrice: price, // Lưu giá đã tăng vào state để hiển thị
                    loading: false 
                });
            } else {
                this.setState({ 
                    error: response.data.errMessage || 'Error retrieving data',
                    loading: false 
                });
            }
        } catch (error) {
            console.log('Error fetching appointments:', error);
            this.setState({ 
                error: 'Failed to fetch deposit information',
                loading: false 
            });
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const { appointmentId, depositAmount } = this.state;

        try {
            const data = {
                token: this.state.depositInfo.token,
                doctorId: this.state.depositInfo.doctorId
            };

            const response = await postVerifyBookAppointment(data);

            if (response && response.errCode === 0) {
                this.setState({ 
                    successMessage: 'Đặt cọc thành công!', 
                    error: null 
                });
            } else {
                this.setState({ 
                    error: response.errMessage || 'Error verifying appointment', 
                    successMessage: null 
                });
            }
        } catch (error) {
            console.log('Error verifying appointment:', error);
            this.setState({ 
                error: 'Failed to verify appointment',
                successMessage: null 
            });
        }
    };

    render() {
        const { appointmentId, depositAmount, depositInfo, adjustedPrice, loading, error, successMessage } = this.state;
    
        if (loading) {
            return <div className="loading">Loading...</div>;
        }
    
        return (
            <>
            <HomeHeader />
            <div className="deposit-container">
                <header className="deposit-header">
                    <h1>Thông tin đặt cọc</h1>
                </header>
                <div className="deposit-content">
                    <h2>Đặt cọc cho lịch hẹn #{appointmentId}</h2>
                    {depositInfo && depositInfo.doctorBooking && (
                        <div className="deposit-info">
                            <p><strong>Thông tin bác sĩ:</strong></p>
                            {depositInfo.doctorData.image && (
                                <div className="doctor-image">
                                    <img 
                                        src={depositInfo.doctorData.image} 
                                        alt={`${depositInfo.doctorData.firstName} ${depositInfo.doctorData.lastName}`} 
                                    />
                                </div>
                            )}
                            <p>Họ tên: {depositInfo.doctorData.firstName} {depositInfo.doctorData.lastName}</p>
                            <p>Tên phòng khám: {depositInfo.doctorBooking.nameClinic}</p>
                            <p>Địa chỉ phòng khám: {depositInfo.doctorBooking.addressClinic}</p>
                            <p>Giá: {adjustedPrice.toLocaleString()} VND</p> {/* Hiển thị giá đã tăng */}
                            <p><strong>Số tiền đặt cọc (50%): {depositAmount} VND</strong></p> {/* Hiển thị số tiền cọc */}
                        </div>
                    )}
                    <form onSubmit={this.handleSubmit} className="deposit-form">
                        <label>Số tiền đặt cọc:</label>
                        <p>{depositAmount} VND</p> {/* Hiển thị số tiền cọc */} 
                        <button type="submit">Xác nhận đặt cọc</button>
                    </form>
                    {successMessage && (
                        <div className="success-message">
                            <p>{successMessage}</p>
                        </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                </div>
            </div></>
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

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Deposit);
