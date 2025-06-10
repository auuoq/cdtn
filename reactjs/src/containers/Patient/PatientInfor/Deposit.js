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
                <nav aria-label="breadcrumb bg-white breadrum">
                    <ol className="breadcrumb bg-transparent shadow-sm">
                        <li className="breadcrumb-item">
                            <a href="/home" style={{ color: "#707070" }}>Trang chủ</a>
                        </li>
                        <li className="breadcrumb-item">
                            <span style={{ color: "#707070" }}>Thông tin đặt cọc</span>
                        </li>
                    </ol>
                </nav>
                <div className="deposit-container">

                    <div className="deposit-content">

                        {packageData && (
                            <div className="deposit-info" style={{
                                display:"flex",

                            }}>
                                {packageData.image && (
                                    <div className="package-image">
                                        <img src={packageData.image} alt={packageData.name}
                                        style={{
                                            height:"100%"
                                            // width:"800px"
                                        }} />
                                    </div>
                                )}
                                <div className='infor'>
                                    <h5 style={{
                                        textAlign:"center",
                                        marginBottom:"8px"
                                    }}>Thông tin đặt cọc</h5>
                                    <p><strong>Tên gói:</strong> {packageData?.name}</p>
                                    <p><strong>Phòng khám:</strong> {packageData.clinicInfo.name}</p>
                                    <p><strong>Địa chỉ:</strong> {packageData.clinicInfo.address}</p>
                                    <p><strong>Giá gói:</strong> <span style={{fontSize:"16px"}}>{new Intl.NumberFormat('fr-FR').format(adjustedPrice)}VND</span></p>
                                    <form onSubmit={this.handleSubmit} className="deposit-form">
                                    <p><strong>Số tiền đặt cọc: </strong> <span style={{color:"#017aff",fontWeight:500}}>{new Intl.NumberFormat('fr-FR').format(depositAmount)} VND</span></p>

                                    <button type="submit">Xác nhận đặt cọc</button>
                                    </form>
                                </div>

                            </div>
                        )}



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
