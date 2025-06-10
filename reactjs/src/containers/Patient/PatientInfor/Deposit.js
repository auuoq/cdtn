import React, { Component } from 'react';
import { connect } from "react-redux";
import './Deposit.scss';
import { getPackageDepositInfo, paymentMomo } from '../../../services/userService';
import HomeHeader from '../../HomePage/HomeHeader';

class Deposit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appointmentId: null,
            depositAmount: '',
            depositInfo: null,
            loading: true,
            error: null,
            successMessage: '',
        };
    }

    async componentDidMount() {
        const { appointmentId } = this.props.match.params;
        this.setState({ appointmentId });

        try {
            const response = await getPackageDepositInfo(appointmentId);
            if (response && response.errCode === 0) {
                const depositInfo = response.data[0];

                const packagePrice = parseFloat(depositInfo.packageData.price);
                const depositPercent = depositInfo.packageData.depositPercent || 0;
                const depositAmount = ((packagePrice * depositPercent) / 100).toFixed(0);

                this.setState({
                    depositInfo,
                    depositAmount,
                    adjustedPrice: packagePrice,
                    loading: false,
                });
            } else {
                this.setState({
                    error: response.errMessage || 'Error retrieving data',
                    loading: false,
                });
            }
        } catch (error) {
            console.error('Error fetching deposit info:', error);
            this.setState({
                error: 'Failed to fetch deposit information',
                loading: false,
            });
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const { depositAmount, depositInfo } = this.state;

        try {
            const res = await paymentMomo({
                deposit: depositAmount,
                token: depositInfo.token,
                packageId: depositInfo.packageId,
            });

            if (res && res.payUrl) {
                window.location.href = res.payUrl; // Redirect tới trang thanh toán MoMo
            } else {
                this.setState({ error: 'Không thể tạo thanh toán MoMo' });
            }
        } catch (error) {
            console.error('Error initiating MoMo payment:', error);
            this.setState({ error: 'Lỗi trong quá trình thanh toán' });
        }
    };


    render() {
        const { appointmentId, depositAmount, depositInfo, adjustedPrice, loading, error, successMessage } = this.state;

        if (loading) {
            return <div className="loading">Loading...</div>;
        }

        const packageData = depositInfo?.packageData;

        return (
            <>
                <HomeHeader />
                <div className="deposit-container">
                    <header className="deposit-header">
                        <h1>Thông tin đặt cọc</h1>
                    </header>
                    <div className="deposit-content">
                        <h2>Đặt cọc cho lịch hẹn #{appointmentId}</h2>

                        {packageData && (
                            <div className="deposit-info">
                                <p><strong>Thông tin gói khám:</strong></p>
                                {packageData.image && (
                                    <div className="package-image">
                                        <img src={packageData.image} alt={packageData.name} />
                                    </div>
                                )}
                                <p><strong>Tên gói:</strong> {packageData.name}</p>
                                <p><strong>Phòng khám:</strong> {packageData.clinicInfo.name}</p>
                                <p><strong>Địa chỉ:</strong> {packageData.clinicInfo.address}</p>
                                <p><strong>Giá gói:</strong> {adjustedPrice.toLocaleString()} VND</p>
                                <p><strong>Số tiền đặt cọc ({packageData.depositPercent}%):</strong> {depositAmount} VND</p>
                            </div>
                        )}

                        <form onSubmit={this.handleSubmit} className="deposit-form">
                            <label>Số tiền đặt cọc:</label>
                            <p>{depositAmount} VND</p>
                            <button type="submit">Xác nhận đặt cọc</button>
                        </form>

                        {successMessage && (
                            <div className="success-message">
                                <p>{successMessage}</p>
                            </div>
                        )}
                        {error && <div className="error-message">{error}</div>}
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(Deposit);
