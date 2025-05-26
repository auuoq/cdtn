import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './DetailSpecialty.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import { getAllDetailSpecialtyById, getAllCodeService } from '../../../services/userService';
import _ from 'lodash';
import { LANGUAGES } from '../../../utils';
import ChatBox from '../../../components/chatbox';
class DetailSpecialty extends Component {

    constructor(props) {
        super(props);
        this.state = {
            arrDoctorId: [],
            dataDetailSpecialty: {},
            listProvince: []
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
        let res = await getAllDetailSpecialtyById({
            id: id,
            location: 'ALL'
        });

        let resProvince = await getAllCodeService('PROVINCE');

        if (res && res.errCode === 0 && resProvince && resProvince.errCode === 0) {
            let data = res.data;
            let arrDoctorId = [];
            if (data && !_.isEmpty(res.data)) {
                let arr = data.doctorSpecialty;
                if (arr && arr.length > 0) {
                    arr.map(item => {
                        arrDoctorId.push(item.doctorId);
                    });
                }
            }

            console.log('arrDoctorId:', arrDoctorId); // Kiểm tra danh sách doctorId sau khi được tạo


            let dataProvince = resProvince.data;
            if (dataProvince && dataProvince.length > 0) {
                dataProvince.unshift({
                    createAt: null,
                    keyMap: "ALL",
                    type: "PROVINCE",
                    valueEn: "ALL",
                    valueVi: "Toàn quốc",
                });
            }

            this.setState({
                dataDetailSpecialty: res.data,
                arrDoctorId: arrDoctorId,
                listProvince: dataProvince ? dataProvince : []
            });
        }
    }
}


    async componentDidUpdate(prevProps, prevState, snapShot) {
        if (this.props.language !== prevProps.language) {

        }
    }

    handleOnChangeSelect = async (event) => {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;
            let location = event.target.value;

            let res = await getAllDetailSpecialtyById({
                id: id,
                location: location
            });
            console.log('API response:', res);

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = [];
                if (data && !_.isEmpty(res.data)) {
                    let arr = data.doctorSpecialty;
                    if (arr && arr.length > 0) {
                        arr.map(item => {
                            arrDoctorId.push(item.doctorId)
                        })
                    }
                }

                this.setState({
                    dataDetailSpecialty: res.data,
                    arrDoctorId: arrDoctorId,
                })
            }

        }
    }

    render() {
        //bug when choose location
        // console.log("check res: ", this.state);
        let { arrDoctorId, dataDetailSpecialty, listProvince } = this.state;
        let { language } = this.props;

        return (
            <div className="detail-specialty-container">
                <HomeHeader />
                <div className="detail-specialty-body">
                    <div className="description-specialty">
                        {dataDetailSpecialty && !_.isEmpty(dataDetailSpecialty)
                            &&
                            <div dangerouslySetInnerHTML={{ __html: dataDetailSpecialty.descriptionHTML }}>

                            </div>
                        }

                    </div>
                    <div className="search-sp-doctor">
                        <select onChange={(event) => this.handleOnChangeSelect(event)}>
                            {listProvince && listProvince.length > 0 &&
                                listProvince.map((item, index) => {
                                    return (
                                        <option key={index} value={item.keyMap}>
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </option>
                                    )
                                })
                            }
                        </select>
                    </div>
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
                                            // dataTime={dataTime}
                                            />
                                        </div>
                                    </div>
                                    <div className="dt-content-right">
                                        <div className="doctor-schedule">
                                            <DoctorSchedule
                                                doctorIdFromParent={item}
                                            />
                                        </div>
                                        <div className="doctor-extra-infor">
                                            <DoctorExtraInfor
                                                doctorIdFromParent={item}
                                            />
                                        </div>

                                    </div>
                                </div>
                            )
                        })
                    }

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

export default connect(mapStateToProps, mapDispatchToProps)(DetailSpecialty);
