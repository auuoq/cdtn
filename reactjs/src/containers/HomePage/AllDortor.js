import React, { Component } from 'react';
import { getAllDoctors } from '../../services/userService';
import './AllClinics.scss';
import { withRouter } from 'react-router';
import HomeHeader from './HomeHeader';
import { LANGUAGES } from "../../utils";
import { connect } from 'react-redux';

class AllDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataDoctors: []
        };
    }

    async componentDidMount() {
        let res = await getAllDoctors();
        if (res && res.errCode === 0) {
            this.setState({ dataDoctors: res.data || [] });
        }
    }

    handleViewDetailDoctor = (doctor) => {
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${doctor.id}`);
        }
    }

    render() {
        let { dataDoctors } = this.state;
        let { language } = this.props;

        return (
            <>
                <HomeHeader />
                <div className="all-specialty-container">
                    <nav aria-label="breadcrumb bg-white ">
                        <ol className="breadcrumb bg-transparent shadow-sm">
                            <li className="breadcrumb-item">
                                <a href="/home" style={{ color: "#707070" }}>Trang chủ</a>
                            </li>
                            <li className="breadcrumb-item">
                                <span style={{ color: "#707070" }}>Danh sách bác sĩ</span>
                            </li>
                        </ol>
                    </nav>

                    <div className="section-share section-outstanding-doctor">
                        <div className="section-container">
                            <div className='section-body'>
                                <div className="row">
                                    {dataDoctors && dataDoctors.length > 0 &&
                                        dataDoctors.map((item, index) => {


                                            let nameVi = `${item.positionData?.valueVi || ''}, ${item.lastName} ${item.firstName}`;
                                            let nameEn = `${item.positionData?.valueEn || ''}, ${item.firstName} ${item.lastName}`;
                                            let specialtyName = item.DoctorInfor?.specialtyData?.name || '';

                                            return (
                                                <div className="col-3 section-customize" key={index} onClick={() => this.handleViewDetailDoctor(item)}>
                                                    <div className='customize-border'>
                                                        <div className='outer-bg'>
                                                            <div className="bg-image section-outstanding-doctor"
                                                                style={{ backgroundImage: `url(${item.image})` }}
                                                            />
                                                        </div>
                                                        <div className='position text-center'>
                                                            <div>{language === LANGUAGES.VI ? nameVi : nameEn}</div>
                                                            <div>{specialtyName}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

export default withRouter(connect(mapStateToProps)(AllDoctor));
