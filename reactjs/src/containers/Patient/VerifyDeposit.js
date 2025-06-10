import React, { Component } from 'react';
import { connect } from "react-redux";
import HomeHeader from '../HomePage/HomeHeader';
import './VerifyEmail.scss';
import { postVerifyDeposit } from '../../services/userService';

class VerifyDeposit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            statusVerify: false,
            errCode: 0
        };
    }

    async componentDidMount() {
        if (this.props.location && this.props.location.search) {
            let urlParams = new URLSearchParams(this.props.location.search);
            let token = urlParams.get('token');
            let packageId = urlParams.get('packageId');
            let payType = urlParams.get('payType');
            let transId = urlParams.get('transId');
            let partnerCode = urlParams.get('partnerCode');
            let orderId = urlParams.get('orderId');
            let requestId = urlParams.get('requestId');

            try {
                let res = await postVerifyDeposit({
                    token,
                    packageId,
                    payType,
                    transId,
                    partnerCode,
                    orderId,
                    requestId,
                });

                if (res && res.errCode === 0) {
                    this.setState({
                        statusVerify: true,
                        errCode: res.errCode
                    });
                } else {
                    this.setState({
                        statusVerify: true,
                        errCode: res?.errCode ?? -1
                    });
                }
            } catch (error) {
                console.error('Error verifying exam package appointment:', error);
                this.setState({
                    statusVerify: true,
                    errCode: -1
                });
            }
        }
    }

    render() {
        const { statusVerify, errCode } = this.state;

        return (
            <>
                <HomeHeader />
                <div className="verify-email-container">
                    {!statusVerify ? (
                        <div>Đang xử lý xác nhận...</div>
                    ) : (
                        <>
                            {+errCode === 0 ? (
                                <div className="infor-booking">Đặt cọc và xác nhận gói khám thành công!</div>
                            ) : (
                                <div className="infor-booking">Gói khám không tồn tại hoặc đã được đặt cọc thành côngcông</div>
                            )}
                        </>
                    )}
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

export default connect(mapStateToProps)(VerifyDeposit);
