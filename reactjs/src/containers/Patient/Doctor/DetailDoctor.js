import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor, getDoctorFeedbacks } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from '../../Patient/Doctor/DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import ChatBox from '../../../components/chatbox';

class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctor: {},
      currentDoctorId: -1,
      address: '',
      loadingMap: true,
      showChatbox: false,
      feedbacks: [],
    };
  }

  toggleChatbox = () => {
    this.setState((prevState) => ({
      showChatbox: !prevState.showChatbox,
    }));
  };

  async componentDidMount() {
    if (this.props.match?.params?.id) {
      let id = this.props.match.params.id;
      this.setState({ currentDoctorId: id });

      let res = await getDetailInforDoctor(id);
      let feedbackRes = await getDoctorFeedbacks(id);

      if (res && res.errCode === 0) {
        this.setState({
          detailDoctor: res.data,
          address: res.data.DoctorInfor.addressClinic || '',
          loadingMap: false,
        });
      } else {
        this.setState({ loadingMap: false });
      }

      if (feedbackRes?.errCode === 0) {
        this.setState({
          feedbacks: feedbackRes.data,
        });
      }
    }
  }

  render() {
    const { language } = this.props;
    const { detailDoctor, address, loadingMap, feedbacks } = this.state;

    let nameVi = '', nameEn = '';
    if (detailDoctor && detailDoctor.positionData) {
      nameVi = `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
      nameEn = `${detailDoctor.positionData.valueEn}, ${detailDoctor.firstName} ${detailDoctor.lastName}`;
    }

    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_EMBED_KEY}&q=${encodeURIComponent(address)}`;

    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className='doctor-detail-container'>
          <div className='intro-doctor'>
            <div className='content-left' style={{ backgroundImage: `url(${detailDoctor.image || ''})` }} />
            <div className='content-right'>
              <div className='up'>{language === LANGUAGES.VI ? nameVi : nameEn}</div>
              <div className='down'>
                {detailDoctor.Markdown?.description && <span>{detailDoctor.Markdown.description}</span>}
              </div>
            </div>
          </div>

          <div className='schedule-doctor'>
            <div className="content-left">
              <DoctorSchedule doctorIdFromParent={this.state.currentDoctorId} />
            </div>
            <div className="content-right">
              <DoctorExtraInfor doctorIdFromParent={this.state.currentDoctorId} />
            </div>
          </div>

          <div style={{ margin: '20px 0', paddingLeft: '50px', paddingRight: '50px', height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            {loadingMap ? (
              <p>Đang tải bản đồ...</p>
            ) : (
              <iframe
                title="doctor-location-map"
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapSrc}
                allowFullScreen
              />
            )}
          </div>

          <div className='detail-infor-doctor'>
            {detailDoctor.Markdown?.contentHTML && (
              <div dangerouslySetInnerHTML={{ __html: detailDoctor.Markdown.contentHTML }} />
            )}
          </div>

          <div className='comment-doctor'>
            <h3>Đánh giá từ bệnh nhân</h3>
            {feedbacks.filter(item => item.isDisplayed).length > 0 ? (
              feedbacks
                .filter(item => item.isDisplayed)
                .map((item, index) => (
                  <div className='comment-card' key={index}>
                    <div className='comment-author'>
                      <strong>{item.patientData?.lastName} {item.patientData?.firstName}</strong>
                    </div>
                    <div className='comment-content'>
                      {item.feedback}
                    </div>
                    <div className='comment-date'>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
            ) : (
              <p>Chưa có đánh giá nào được hiển thị.</p>
            )}
          </div>

        </div>

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
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(DetailDoctor);
