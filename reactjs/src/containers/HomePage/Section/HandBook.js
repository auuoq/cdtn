import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import tamthan from "../../../assets/imagecamnang/tamthan.png"
import benhkhac from "../../../assets/imagecamnang/benhkhac.png"
import than from "../../../assets/imagecamnang/than.png"
import mat from "../../../assets/imagecamnang/mat.png"
import tieuhoa from "../../../assets/imagecamnang/tieuhoa.png"
import tuyengiap from "../../../assets/imagecamnang/tuyengiap.png"

class HandBook extends Component {
    render() {
        const sliderSettings = {
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                    }
                }
            ]
        };

        const handbooks = [
            {
                id: 1,
                title: 'Thoái hóa khớp',
                link: 'https://tamanhhospital.vn/cac-benh-co-xuong-khop/',
                image: mat
            },
            {
                id: 2,
                title: 'Viêm khớp dạng thấp',
                link: 'https://umcclinic.com.vn/benh-co-xuong-khop',
                image: tamthan// ví dụ ảnh khớp
            },
            {
                id: 3,
                title: 'Thoát vị đĩa đệm',
                link: 'https://bvnguyentriphuong.com.vn/dieu-duong/tham-kham-lam-sang-va-can-lam-sang-co-xuong-khop',
                image: than 
// ví dụ ảnh cột sống
            },
            {
                id: 4,
                title: 'Loãng xương',
                link: 'https://vinmec.com/vie/bai-viet/top-7-can-benh-xuong-khop-pho-bien-o-nguoi-viet-nam-vi',
                image: tieuhoa
            },
            {
                id: 5,
                title: 'Đau thần kinh tọa',
                link: 'https://optimal365.vn/cac-benh-co-xuong-khop/',
                image: tuyengiap
            },
            {
                id: 6,
                title: 'Bệnh khác',
                link: '#',
                image: benhkhac
            },
        ];

        return (
            <div className='section-share section-handbook'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>Cẩm nang</span>
                        {/* <button className='btn-section'>Xem thêm</button> */}
                    </div>
                    <div className='section-body'>
                        <Slider {...sliderSettings}>
                            {handbooks.map(item => (
                                <div key={item.id} className="section-customize" style={{ cursor: 'pointer' }}>
                                    <a href={item.link} style={{ textDecoration: 'none', color: 'inherit' }} target="_blank" rel="noopener noreferrer">
                                        <div 
                                            className="bg-image section-handbook" 
                                            style={{ 
                                                backgroundImage: `url(${item.image})`, 
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                height: '150px',
                                                marginBottom: '10px',
                                            }} 
                                        />
                                        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.title}</div>
                                    </a>
                                </div>
                            ))}
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

export default connect(mapStateToProps)(HandBook);
