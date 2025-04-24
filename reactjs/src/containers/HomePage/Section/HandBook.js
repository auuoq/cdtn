import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";


class HandBook extends Component {
    render() {
        const sliderSettings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 4, // Mặc định hiển thị 4 slide
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024, // Màn hình <= 1024px
                    settings: {
                        slidesToShow: 3, // Hiển thị 3 slide
                    }
                },
                {
                    breakpoint: 768, // Màn hình <= 768px
                    settings: {
                        slidesToShow: 2, // Hiển thị 2 slide
                    }
                },
                {
                    breakpoint: 480, // Màn hình <= 480px
                    settings: {
                        slidesToShow: 2, // Hiển thị 1 slide
                    }
                }
            ]
        };

        return (
            <div className='section-share section-handbook'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>Cẩm nang</span>
                        <button className='btn-section'>Xem thêm</button>
                    </div>
                    <div className='section-body'>
                        <Slider {...sliderSettings}>
                            <div className="section-customize">
                                <div className="bg-image section-handbook" />
                                <div>Cơ xương khớp 1</div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-handbook" />
                                <div>Cơ xương khớp 2</div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-handbook" />
                                <div>Cơ xương khớp 3</div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-handbook" />
                                <div>Cơ xương khớp 4</div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-handbook" />
                                <div>Cơ xương khớp 5</div>
                            </div>
                            <div className="section-customize">
                                <div className="bg-image section-handbook" />
                                <div>Cơ xương khớp 6</div>
                            </div>

                        </Slider>
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

export default connect(mapStateToProps, mapDispatchToProps)(HandBook);
