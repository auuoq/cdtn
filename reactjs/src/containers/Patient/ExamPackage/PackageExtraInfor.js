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
        }
    }

    showHideDetailInfor = (status) => {
        this.setState({
            isShowDetailInfor: status
        })
    }

    render() {
        let { isShowDetailInfor } = this.state;
        let { language, detailPackage } = this.props;

        return (
            <div className="doctor-extra-infor-container">
                <div className="content-up">
                    <div className="text-address">
                        <FormattedMessage id="patient.extra-infor-package.text-address" />
                    </div>
                    <div className="name-clinic">
                        {detailPackage && detailPackage.clinicInfo ? detailPackage.clinicInfo.name : ''}
                    </div>
                    <div className="detail-address">
                        {detailPackage && detailPackage.clinicInfo ? detailPackage.clinicInfo.address : ''}
                    </div>
                </div>
                <div className="content-down">
                    {isShowDetailInfor === false &&
                        <div className="short-infor">
                            <FormattedMessage id="patient.extra-infor-package.price" />
                            {detailPackage && detailPackage.price && language === LANGUAGES.VI
                                &&
                                <span className="currency">
                                    {new Intl.NumberFormat('vi-VN').format(detailPackage.price)} VND
                                </span>
                            }

                            {detailPackage && detailPackage.price && language === LANGUAGES.EN
                                &&
                                <span className="currency">
                                    {new Intl.NumberFormat('en-US').format(detailPackage.price)} $
                                </span>
                            }
                            <span className="detail" onClick={() => this.showHideDetailInfor(true)}>
                                <FormattedMessage id="patient.extra-infor-package.detail" />
                            </span>
                        </div>
                    }
                    {isShowDetailInfor === true &&
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
                                        {detailPackage && detailPackage.price && language === LANGUAGES.VI &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailPackage.price)}
                                            </span>
                                        }
                                        {detailPackage && detailPackage.price && language === LANGUAGES.EN &&
                                            <span className="currency">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(detailPackage.price)}
                                            </span>
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="payment">
                                <FormattedMessage id="patient.extra-infor-package.payment" />
                                {detailPackage && detailPackage.paymentTypeData && language === LANGUAGES.VI ?
                                    detailPackage.paymentTypeData.valueVi : ''}
                                {detailPackage && detailPackage.paymentTypeData && language === LANGUAGES.EN ?
                                    detailPackage.paymentTypeData.valueEn : ''}
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