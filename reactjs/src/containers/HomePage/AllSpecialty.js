import React, { Component } from 'react';
import { getAllSpecialty } from '../../services/userService';
import './AllSpecialty.scss';
import { withRouter } from 'react-router';

class AllSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSpecialty: []
        };
    }

    async componentDidMount() {
        let res = await getAllSpecialty();
        if (res && res.errCode === 0) {
            this.setState({ dataSpecialty: res.data || [] });
        }
    }

    handleViewDetailSpecialty = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${item.id}`);
        }
    }

    render() {
        let { dataSpecialty } = this.state;

        return (
            <div className="all-specialty-container">
                <h2 className="title">Danh sách chuyên khoa</h2>
                <div className="specialty-grid">
                    {dataSpecialty && dataSpecialty.length > 0 &&
                        dataSpecialty.map((item, index) => (
                            <div
                                key={index}
                                className="specialty-card"
                                onClick={() => this.handleViewDetailSpecialty(item)}
                            >
                                <div className="bg-image" style={{ backgroundImage: `url(${item.image})` }} />
                                <div className="name">{item.name}</div>
                            </div>
                        ))}
                </div>
            </div>
        );
    }
}

export default withRouter(AllSpecialty);
