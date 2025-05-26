import React, { Component } from 'react';
import { connect } from "react-redux";
import './DetailClinic.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import { getAllDetailClinicById } from '../../../services/userService';
import ChatBox from '../../../components/chatbox';
import _ from 'lodash';

class DetailClinic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            arrDoctorId: [],
            dataDetailClinic: {},
        }
    }
    state = {
        detailDoctor: {},
        currentDoctorId: -1,
        address: '',
        loadingMap: true,
        showChatbox: false,
        };

        toggleChatbox = () => {
        this.setState((prevState) => ({
            showChatbox: !prevState.showChatbox,
        }));
    };


    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;
            let res = await getAllDetailClinicById({
                id: id
            });

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = [];
                if (data && !_.isEmpty(res.data)) {
                    let arr = data.doctorClinic;
                    if (arr && arr.length > 0) {
                        arr.forEach(item => {
                            arrDoctorId.push(item.doctorId);
                        });
                    }
                }

                this.setState({
                    dataDetailClinic: res.data,
                    arrDoctorId: arrDoctorId,
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.language !== prevProps.language) {

        }
    }


    render() {
        let { arrDoctorId, dataDetailClinic } = this.state;

        return (
            <div className="detail-specialty-container">
                <HomeHeader />
                <div className="detail-specialty-body">
                    <div className="clinic-info-container">
                        {dataDetailClinic && !_.isEmpty(dataDetailClinic) && (
                            <>
                                {/* Bố cục Flexbox: Hình ảnh bên trái, name và address bên phải */}
                                <div className="clinic-info">
                                    {/* Hình ảnh bên trái */}
                                    {dataDetailClinic.image && (
                                        <div className="clinic-image">
                                            <img
                                                src={dataDetailClinic.image}
                                                alt={dataDetailClinic.name}
                                                style={{ width: "150px", height: "150px", borderRadius: "8px", objectFit: "cover" }}
                                            />
                                        </div>
                                    )}

                                    {/* Name và Address bên phải */}
                                    <div className="clinic-details">
                                        <h1>{dataDetailClinic.name}</h1>
                                        <p>{dataDetailClinic.address}</p>
                                    </div>
                                </div>

                                {/* Mô tả phòng khám */}
                                <div className="description">
                                    <div>Giới thiệu</div>
                                    <div dangerouslySetInnerHTML={{ __html: dataDetailClinic.descriptionHTML }} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Danh sách bác sĩ */}
                    {arrDoctorId && arrDoctorId.length > 0 &&
                        arrDoctorId.map((item, index) => {
                            return (
                                <div className="each-doctor" key={index}>
                                    <div className="dt-content-left">
                                        <div className="profile-doctor">
                                            <ProfileDoctor
                                                doctorId={item}
                                                isShowDescriptionDoctor={true}
                                                isSHowLinkDetail={true}
                                                isShowPrice={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="dt-content-right">
                                        <div className="doctor-schedule">
                                            <DoctorSchedule doctorIdFromParent={item} />
                                        </div>
                                        <div className="doctor-extra-infor">
                                            <DoctorExtraInfor doctorIdFromParent={item} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                {/* Nút mở chatbox */}
                <div
                onClick={this.toggleChatbox}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 1001,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    fontSize: '24px',
                }}
                title="Nhắn tin với bác sĩ"
                >
                💬
                </div>

                {/* ChatBox hiển thị khi bật */}
                {this.state.showChatbox && (
                <div
                    style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '20px',
                    zIndex: 1000,
                    width: '320px',
                    maxHeight: '500px',
                    background: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    }}
                >
                    <ChatBox />
                </div>
                )}

            </div>

        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailClinic);
