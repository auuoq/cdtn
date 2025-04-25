import React, { Component } from 'react';
import { connect } from "react-redux";
import './Manager_Booking.scss';
import { getDetailClinicByManager } from '../../../services/userService'; // API mới
import ProfileDoctor from '../../Patient/Doctor/ProfileDoctor'; // Import ProfileDoctor component
import DoctorSchedule from '../../Patient/Doctor/DoctorSchedule'; // Import DoctorSchedule component
import DoctorExtraInfor from '../../Patient/Doctor/DoctorExtraInfor'; // Import DoctorExtraInfor component

class Manage_Booking extends Component {

    constructor(props) {
        super(props);
        this.state = {
            arrDoctorId: [],
            dataDetailClinic: {},
        };
    }

    async componentDidMount() {
        const { userId } = this.props; // Lấy userId từ props (có thể lấy từ redux hoặc props)
        let res = await getDetailClinicByManager({
            userId: userId.id, // Chuyển userId vào API để lọc phòng khám và bác sĩ
        });

        if (res && res.errCode === 0) {
            let data = res.data;
            let arrDoctorId = [];
            if (data && data.doctorClinic && data.doctorClinic.length > 0) {
                arrDoctorId = data.doctorClinic.map(item => item.doctorId); // Lấy danh sách doctorId
            }

            this.setState({
                dataDetailClinic: data,
                arrDoctorId: arrDoctorId,
            });
        }
    }

    render() {
        let { arrDoctorId, dataDetailClinic } = this.state;

        return (
            <div className="detail-specialty-container">
                <div className="detail-specialty-body">
                    <div className="clinic-info-container">
                        {dataDetailClinic && dataDetailClinic.name && (
                            <>
                                <div className="clinic-info">
                                    {dataDetailClinic.image && (
                                        <div className="clinic-image">
                                            <img
                                                src={dataDetailClinic.image}
                                                alt={dataDetailClinic.name}
                                                style={{ width: "150px", height: "150px", borderRadius: "8px", objectFit: "cover" }}
                                            />
                                        </div>
                                    )}
                                    <div className="clinic-details">
                                        <h1>{dataDetailClinic.name}</h1>
                                        <p>{dataDetailClinic.address}</p>
                                    </div>
                                </div>

                                {/* <div className="description">
                                    <div>Giới thiệu</div>
                                    <div dangerouslySetInnerHTML={{ __html: dataDetailClinic.descriptionHTML }} />
                                </div> */}
                            </>
                        )}
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
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        userId: state.user.userInfo, // Thêm userId từ redux nếu có
    };
};

export default connect(mapStateToProps)(Manage_Booking);
