import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

class About extends Component {
    render() {

        return (
            <div className='section-share section-about'>
                <div className='section-about-header'>
                    Truyền thông nói gì về BK
                </div>
                <div className='section-about-content'>
                    <div className='content-left'>
                        <iframe width="100%" height="400px"
                            src="https://www.youtube.com/embed/a6r2ecSaup8"
                            title="HỆ THỐNG ĐẶT LỊCH KHÁM TRỰC TUYẾN"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen></iframe>
                    </div>
                    <div className='content-right'> 
                        <p>
                            Chào mừng bạn đến với trang web đặt lịch hẹn với bác sĩ của chúng tôi! Chúng tôi hiểu tầm quan trọng của việc tiếp cận chăm sóc y tế kịp thời, đó là lý do tại sao chúng tôi đã tạo ra một nền tảng cho phép bạn dễ dàng đặt lịch hẹn với các bác sĩ có trình độ chỉ bằng vài cú nhấp chuột. Trang web của chúng tôi thân thiện với người dùng và được thiết kế để cung cấp cho bạn trải nghiệm liền mạch từ đầu đến cuối. Cho dù bạn cần lên lịch kiểm tra sức khỏe định kỳ hay có mối lo ngại về y tế cần được chăm sóc kịp thời, chúng tôi luôn sẵn sàng trợ giúp.                        </p>
                    </div>
                </div>

            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
