import React, { Component } from 'react';
import { getAllClinic, searchClinic } from '../../services/userService';
import './AllClinics.scss';
import { withRouter } from 'react-router';

class AllClinics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinics: [],
            searchKeyword: '',
            loading: false,
        };
    }

    componentDidMount() {
        this.fetchClinics();
    }

    fetchClinics = async () => {
        this.setState({ loading: true });
        let res = await getAllClinic();
        if (res && res.errCode === 0) {
            this.setState({
                clinics: res.data ? res.data : [],
                loading: false,
            });
        } else {
            this.setState({ loading: false });
        }
    }

    handleSearchChange = (event) => {
        this.setState({ searchKeyword: event.target.value });
    }

    handleSearch = async () => {
        this.setState({ loading: true });
        let { searchKeyword } = this.state;
        if (!searchKeyword) {
            await this.fetchClinics();
        } else {
            let res = await searchClinic(searchKeyword);
            if (res && res.errCode === 0) {
                this.setState({
                    clinics: res.data,
                    loading: false,
                });
            } else {
                this.setState({ loading: false });
            }
        }
    }

    handleViewDetailClinic = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`);
        }
    }

    render() {
        let { clinics, searchKeyword, loading } = this.state;

        return (
            <div className="all-clinics-container">
                <h2 className="title">Tất cả cơ sở y tế</h2>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm cơ sở y tế theo tên..."
                        value={searchKeyword}
                        onChange={this.handleSearchChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') this.handleSearch(); }}
                    />
                    <button onClick={this.handleSearch}>Tìm kiếm</button>
                </div>

                {loading && <div>Đang tải dữ liệu...</div>}

                <div className="clinic-grid">
                    {clinics && clinics.length > 0 ? (
                        clinics.map((clinic, index) => (
                            <div
                                key={index}
                                className="clinic-card"
                                onClick={() => this.handleViewDetailClinic(clinic)}
                            >
                                <div className="bg-image" style={{ backgroundImage: `url(${clinic.image})` }} />
                                <div className="name">{clinic.name}</div>
                            </div>
                        ))
                    ) : (
                        <div>Không tìm thấy cơ sở y tế nào.</div>
                    )}
                </div>
            </div>
        );
    }
}

export default withRouter(AllClinics);
