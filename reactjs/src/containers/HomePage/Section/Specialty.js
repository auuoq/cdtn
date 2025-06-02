import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Specialty.scss';
import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";
import { getAllSpecialty } from '../../../services/userService';
import { withRouter } from 'react-router';

class Specialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSpecialty: []
        }
    }

    async componentDidMount() {
        let res = await getAllSpecialty();
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data ? res.data : []
            })
        }
    }

    handleViewDetailSpecialty = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${item.id}`);
        }
    }
    handleViewMoreSpecialty = () => {
        if (this.props.history) {
            this.props.history.push('/kham-chuyen-khoa');
        }
    }

    render() {
        let { dataSpecialty } = this.state;

        // Cấu hình cho Slider (cập nhật responsive)
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
            <div className='section-share section-specialty'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>
                            <FormattedMessage id="homepage.specialty-popular" />
                        </span>
                        <button className='btn-section' onClick={this.handleViewMoreSpecialty}>
                            <FormattedMessage id="homepage.more-infor" />
                        </button>

                    </div>
                    <div className='section-body'>
                        <Slider {...sliderSettings}> {/* Cập nhật props settings */}
                            {dataSpecialty && dataSpecialty.length > 0 &&
                                dataSpecialty.map((item, index) => {
                                    return (
                                        <div
                                            className="section-customize specialty-child"
                                            key={index}
                                            onClick={() => this.handleViewDetailSpecialty(item)}
                                        >
                                            <div className="bg-image section-specialty"
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            />
                                            <div className="specialty-name text-center">{item.name}</div>
                                        </div>
                                    )
                                })
                            }
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Specialty));
