import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorExtraInfor.scss';
import { LANGUAGES } from '../../../utils';
import { getExtraInforDoctorById } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';

class DoctorExtraInfor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShowDetailInfor: false,
            extraInfor: {}
        }
    }

    async componentDidMount() {
        if (this.props.doctorIdFromParent) {
            let res = await getExtraInforDoctorById(this.props.doctorIdFromParent);
            if (res && res.errCode === 0) {
                this.setState({
                    extraInfor: res.data
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
            let res = await getExtraInforDoctorById(this.props.doctorIdFromParent);
            if (res && res.errCode === 0) {
                this.setState({
                    extraInfor: res.data
                })
            }
        }
    }

    showHideDetailInfor = (status) => {
        this.setState({
            isShowDetailInfor: status
        })
    }

    render() {
        let { isShowDetailInfor, extraInfor } = this.state;
        let { language } = this.props;

        // Tính toán giá ngoài giờ, thêm 50%
        let priceVi = extraInfor && extraInfor.priceTypeData && extraInfor.priceTypeData.valueVi
            ? extraInfor.priceTypeData.valueVi * 1.5
            : 0;

        let priceEn = extraInfor && extraInfor.priceTypeData && extraInfor.priceTypeData.valueEn
            ? extraInfor.priceTypeData.valueEn * 1.5
            : 0;

        return (
            <div className="doctor-extra-infor-container">
                <div className="content-up">
                    <div className="text-address">
                        <FormattedMessage id="patient.extra-infor-doctor.text-address" />
                    </div>
                    <div className="name-clinic">
                        {extraInfor && extraInfor.nameClinic ? extraInfor.nameClinic : ''}
                    </div>
                    <div className="detail-address">
                        {extraInfor && extraInfor.addressClinic ? extraInfor.addressClinic : ''}
                    </div>
                </div>
                <div className="content-down">
                    {isShowDetailInfor === false &&
                        <div className="short-infor">
                            <FormattedMessage id="patient.extra-infor-doctor.price" />
                            {extraInfor && extraInfor.priceTypeData && language === LANGUAGES.VI
                                &&
                                <span className="currency">
                                    {new Intl.NumberFormat('vi-VN').format(extraInfor.priceTypeData.valueVi)} VND
                                </span>
                            }

                            {extraInfor && extraInfor.priceTypeData && language === LANGUAGES.EN
                                &&
                                <span className="currency">
                                    {new Intl.NumberFormat('en-US').format(extraInfor.priceTypeData.valueEn)} $
                                </span>
                            }
                            <span className="detail" onClick={() => this.showHideDetailInfor(true)}>
                                <FormattedMessage id="patient.extra-infor-doctor.detail" />
                            </span>
                        </div>
                    }
                    {isShowDetailInfor === true &&
                        <>
                            <div className="title-price">
                                <FormattedMessage id="patient.extra-infor-doctor.price" />
                            </div>
                            <div className="detail-infor">
                                <div className="price">
                                    <span className="left">
                                        <FormattedMessage id="patient.extra-infor-doctor.price" />
                                    </span>
                                    <span className="right">
                                        {extraInfor && extraInfor.priceTypeData && language === LANGUAGES.VI &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(extraInfor.priceTypeData.valueVi)}
                                            </span>
                                        }
                                        {extraInfor && extraInfor.priceTypeData && language === LANGUAGES.EN &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(extraInfor.priceTypeData.valueEn)}
                                            </span>
                                        }
                                    </span>
                                </div>

                                <div className="price">
                                    <span className="left">
                                        <FormattedMessage id="patient.extra-infor-doctor.extra-price" />
                                    </span>
                                    <span className="right">
                                        {language === LANGUAGES.VI && 
                                            <span className="currency">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVi)}
                                            </span>
                                        }
                                        {language === LANGUAGES.EN && 
                                            <span className="currency">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceEn)}
                                            </span>
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="payment">
                                <FormattedMessage id="patient.extra-infor-doctor.payment" />
                                {extraInfor && extraInfor.paymentTypeData && language === LANGUAGES.VI ?
                                    extraInfor.paymentTypeData.valueVi : ''}
                                {extraInfor && extraInfor.paymentTypeData && language === LANGUAGES.EN ?
                                    extraInfor.paymentTypeData.valueEn : ''}
                            </div>
                            <div className="hide-price">
                                <span onClick={() => this.showHideDetailInfor(false)}>
                                    <FormattedMessage id="patient.extra-infor-doctor.hide-price" />
                                </span>
                            </div>
                        </>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

export default connect(mapStateToProps)(DoctorExtraInfor);
