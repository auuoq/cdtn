import React, { Component } from 'react';
import { connect } from 'react-redux';
import './MedicalFacility.scss';
import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";
import { getAllClinic } from '../../../services/userService';
import { withRouter } from 'react-router';

class MedicalFacility extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataClinics: []
        }
    }

    async componentDidMount() {
        let res = await getAllClinic();
        if (res && res.errCode === 0) {
            this.setState({
                dataClinics: res.data ? res.data : []
            })
        }
    }

    handleViewDetailClinic = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`);
        }
    }

    handleViewMoreClinic = () => {
        if (this.props.history) {
            this.props.history.push('/all-clinic');
        }
    }

    render() {
        let { dataClinics } = this.state;

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
            <div className='section-share section-medical-facility'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>Cơ sở y tế nổi bật</span>
                        <button className='btn-section' onClick={this.handleViewMoreClinic}>Xem thêm</button>
                    </div>
                    <div className='section-body'>
                        <Slider {...sliderSettings}>
                            {
                                dataClinics && dataClinics.length > 0 &&
                                dataClinics.map((item, index) => {
                                    return (
                                        <div className="section-customize clinic-child"
                                            key={index}
                                            onClick={() => this.handleViewDetailClinic(item)}
                                        >
                                            <div className="bg-image section-medical-facility"
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            />
                                            <div className="clinic-name">{item.name}</div>
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
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MedicalFacility));
