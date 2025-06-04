import React, { Component } from 'react';
import { getAllClinic, getAllDoctors } from '../../services/userService';
import './AllClinics.scss';
import { withRouter } from 'react-router';
import HomeHeader from './HomeHeader';

class AllDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSpecialty: []
        };
    }

    async componentDidMount() {
        let res = await getAllDoctors();
        if (res && res.errCode === 0) {
            this.setState({ dataSpecialty: res.data || [] });
        }
    }

    handleViewDetailSpecialty = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${item.id}`);
        }
    }

    render() {
        let { dataSpecialty } = this.state;

        return (
            <>
                <HomeHeader/>
                <div className="all-specialty-container">
                    <nav aria-label="breadcrumb bg-white ">
                        <ol className="breadcrumb bg-transparent shadow-sm">
                        <li className="breadcrumb-item" >
                            <a href="/home" style={{
                                color :"#707070"
                            }}>Trang chủ</a>
                        </li>
                        <li className="breadcrumb-item">
                            <a href="#"  style={{
                                color :"#707070"
                            }}>Danh sách bác sĩ</a>
                        </li>

                        </ol>
                    </nav>
                    <div className="specialty-grid">
                        {dataSpecialty && dataSpecialty.length > 0 &&
                            dataSpecialty.map((item, index) => (
                                <div
                                    key={index}
                                    className="specialty-card"
                                    onClick={() => this.handleViewDetailSpecialty(item)}
                                >
                                    <div className="bg-image" style={{ backgroundImage: `url(https://benhvientantao.com/wp-content/uploads/2022/07/chi-co-bac-si-moi-giup-duoc-e93.jpg)` }} />
                                    <div className="name">{`${item.firstName} ${item.lastName}`}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </>
        );
    }
}

export default withRouter(AllDoctor);
