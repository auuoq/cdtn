// DetailExamPackage.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailPackage.scss';
import { getDetailExamPackageById } from '../../../services/userService';

class DetailPackage extends Component {
    state = {
        detailPackage: {},
    };

    async componentDidMount() {
        if (this.props.match?.params?.id) {
            const id = this.props.match.params.id;
            let res = await getDetailExamPackageById(id);
            if (res && res.errCode === 0) {
                this.setState({ detailPackage: res.data });
            }
        }
    }

    render() {
        const { detailPackage } = this.state;
        const {
            name,
            image,
            description,
            contentHTML,
            clinicInfo,
            provinceTypeData,
            categoryTypeData,
            paymentTypeData,
            price,
        } = detailPackage;

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="exam-package-detail-container">
                    <div className="intro-package">
                        <div
                            className="content-left"
                            style={{ backgroundImage: `url(${image || ''})` }}
                        />
                        <div className="content-right">
                            <div className="up">{name}</div>
                            <div className="down">
                                <span>{description}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-package">
                        <p><strong>Phòng khám:</strong> {clinicInfo?.name}</p>
                        <p><strong>Địa chỉ:</strong> {clinicInfo?.address}</p>
                        <p><strong>Khu vực:</strong> {provinceTypeData?.valueVi}</p>
                        <p><strong>Danh mục:</strong> {categoryTypeData?.valueVi}</p>
                        <p><strong>Hình thức thanh toán:</strong> {paymentTypeData?.valueVi}</p>
                        <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN').format(price)} VND</p>
                    </div>

                    <div className="detail-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />

                    <div className="comment-package">
                        {/* future: Facebook comment plugin or rating system */}
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(DetailPackage);
