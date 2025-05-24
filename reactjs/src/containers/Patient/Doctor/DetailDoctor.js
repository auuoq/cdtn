import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from '../../Patient/Doctor/DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';

class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctor: {},
      currentDoctorId: -1,
      address: '',
      loadingMap: true,
    };
  }

  async componentDidMount() {
    if (this.props.match?.params?.id) {
      let id = this.props.match.params.id;
      this.setState({ currentDoctorId: id });

      let res = await getDetailInforDoctor(id);
      if (res && res.errCode === 0) {
        this.setState({
          detailDoctor: res.data,
          address: res.data.Doctor_Infor.addressClinic || '',
          loadingMap: false,
        });
      console.log('res', res.data.Doctor_Infor.addressClinic);
      } else {
        this.setState({ loadingMap: false });
      }
    }
  }

  render() {
    const { language } = this.props;
    const { detailDoctor, address, loadingMap } = this.state;
    let nameVi = '', nameEn = '';
    if (detailDoctor && detailDoctor.positionData) {
      nameVi = `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
      nameEn = `${detailDoctor.positionData.valueEn}, ${detailDoctor.firstName} ${detailDoctor.lastName}`;
    }

    // Tạo URL iframe Google Maps Embed
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_EMBED_KEY}&q=${encodeURIComponent(address)}`;
    const key = process.env.REACT_APP_GOOGLE_MAPS_EMBED_KEY;
    console.log('Google Maps API Key:', key);
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className='doctor-detail-container'>
          <div className='intro-doctor'>
            <div
              className='content-left'
              style={{ backgroundImage: `url(${detailDoctor.image || ''})` }}
            />
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
                    {/* Bản đồ Google Maps Embed */}
          <div style={{ margin: '20px 0', paddingLeft: '50px',paddingRight: '50px', height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
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

          <div className='comment-doctor'></div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(DetailDoctor);
