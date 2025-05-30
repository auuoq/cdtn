import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../../utils';
import './PackageExtraInfor.scss';

class PackageExtraInfor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowDetailInfor: false
        };
    }

    showHideDetailInfor = (status) => {
        this.setState({
            isShowDetailInfor: status
        });
    }

    render() {
        let { isShowDetailInfor } = this.state;
        let { language, detailPackage } = this.props;

        // Tỷ giá tạm tính: 1 USD = 24,000 VND
        const exchangeRate = 24000;

        let priceVi = detailPackage?.price || 0;
        let priceEn = priceVi / exchangeRate;

        let extraPriceVi = priceVi * 1.5;
        let extraPriceEn = priceEn * 1.5;

        return (
            <div className="doctor-extra-infor-container">
                <div className="content-up">
                    <div className="text-address">
                        <FormattedMessage id="patient.extra-infor-package.text-address" />
                    </div>
                    <div className="name-clinic">
                        {detailPackage?.clinicInfo?.name || ''}
                    </div>
                    <div className="detail-address">
                        {detailPackage?.clinicInfo?.address || ''}
                    </div>
                </div>
                <div className="content-down">
                    {!isShowDetailInfor &&
                        <div className="short-infor">
                            <FormattedMessage id="patient.extra-infor-package.price" />
                            {language === LANGUAGES.VI &&
                                <span className="currency">
                                    {new Intl.NumberFormat('vi-VN').format(priceVi)} VND
                                </span>
                            }
                            {language === LANGUAGES.EN &&
                                <span className="currency">
                                    {new Intl.NumberFormat('en-US').format(priceEn)} $
                                </span>
                            }
                            <span className="detail" onClick={() => this.showHideDetailInfor(true)}>
                                <FormattedMessage id="patient.extra-infor-package.detail" />
                            </span>
                        </div>
                    }

                    {isShowDetailInfor &&
                        <>
                            <div className="title-price">
                                <FormattedMessage id="patient.extra-infor-package.price" />
                            </div>
                            <div className="detail-infor">
                                <div className="price">
                                    <span className="left">
                                        <FormattedMessage id="patient.extra-infor-package.price" />
                                    </span>
                                    <span className="right">
                                        {language === LANGUAGES.VI &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(priceVi)}
                                            </span>
                                        }
                                        {language === LANGUAGES.EN &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(priceEn)}
                                            </span>
                                        }
                                    </span>
                                </div>

                                <div className="price">
                                    <span className="left">
                                        <FormattedMessage id="patient.extra-infor-package.extra-price" />
                                    </span>
                                    <span className="right">
                                        {language === LANGUAGES.VI &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(extraPriceVi)}
                                            </span>
                                        }
                                        {language === LANGUAGES.EN &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD'
                                                }).format(extraPriceEn)}
                                            </span>
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="payment">
                                <FormattedMessage id="patient.extra-infor-package.payment" />
                                {language === LANGUAGES.VI
                                    ? detailPackage?.paymentTypeData?.valueVi || ''
                                    : detailPackage?.paymentTypeData?.valueEn || ''}
                            </div>

                            <div className="hide-price">
                                <span onClick={() => this.showHideDetailInfor(false)}>
                                    <FormattedMessage id="patient.extra-infor-package.hide-price" />
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

export default connect(mapStateToProps)(PackageExtraInfor);
