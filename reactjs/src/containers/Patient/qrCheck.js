import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../HomePage/HomeHeader';
import './VerifyEmail.scss';
import axios from 'axios';

class QrCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qrContent: '',
            bookingData: null,
            error: '',
            type: '',
        };
    }

    async componentDidMount() {
        if (this.props.location?.search) {
            let urlParams = new URLSearchParams(this.props.location.search);
            let type = urlParams.get('type');
            let token = urlParams.get('token');

            if (!type || !token) {
                this.setState({ error: 'Thiếu thông tin type hoặc token trong đường dẫn.' });
                return;
            }

            const qrContent = JSON.stringify({ type, token });
            this.setState({ qrContent, type });

            try {
                const res = await axios.get(`http://192.168.0.101:8080/api/check-booking-by-qr-code?type=${type}&token=${token}`);
                if (res.data?.errCode === 0) {
                    this.setState({ bookingData: res.data.bookingData });
                } else {
                    this.setState({ error: res.data.errMessage || 'Không tìm thấy thông tin.' });
                }
            } catch (err) {
                this.setState({ error: 'Có lỗi xảy ra khi xác thực QR.' });
            }
        } else {
            this.setState({ error: 'Không tìm thấy mã QR trong đường dẫn.' });
        }
    }

    renderBookingInfo = () => {
        const { bookingData, type } = this.state;

        if (type === 'doctor') {
            const patient = bookingData.patientData || {};
            const doctor = bookingData.doctorData || {};
            const time = bookingData.timeTypeDataPatient || {};
            const status = bookingData.statusIdDataPatient || {};
            const doctorInfo = bookingData.doctorBooking || {};
            const specialty = doctorInfo.specialtyData || {};
            const clinic = doctorInfo.clinicData || {};

            return (
                <>
                    <h3 className="text-xl font-semibold mb-3">✅ Đặt khám bác sĩ</h3>
                    <p><strong>👤 Họ tên:</strong> {patient.firstName} {patient.lastName}</p>
                    <p><strong>📧 Email:</strong> {patient.email}</p>
                    <p><strong>🕒 Ngày khám:</strong> {new Date(+bookingData.date).toLocaleDateString('vi-VN')}</p>
                    <p><strong>⏰ Khung giờ:</strong> {time.valueVi}</p>
                    <p><strong>🩺 Bác sĩ:</strong> {doctor.firstName} {doctor.lastName}</p>
                    <p><strong>🏥 Chuyên khoa:</strong> {specialty.name}</p>
                    <p><strong>🏢 Cơ sở:</strong> {clinic.name} - {clinic.address}</p>
                    <p><strong>📄 Lý do khám:</strong> {bookingData.reason}</p>
                    <p><strong>📌 Trạng thái:</strong> {status.valueVi}</p>
                </>
            );
        } else if (type === 'package') {
            const patient = bookingData.patientData || {};
            const pkg = bookingData.packageData || {};
            const time = bookingData.timeTypeDataPatient || {};
            const status = bookingData.statusIdDataPatient || {};
            const clinic = pkg.clinicInfo || {};

            return (
                <>
                    <h3 className="text-xl font-semibold mb-3">✅ Đặt gói khám</h3>
                    <p><strong>👤 Họ tên:</strong> {patient.firstName} {patient.lastName}</p>
                    <p><strong>📧 Email:</strong> {patient.email}</p>
                    <p><strong>🕒 Ngày khám:</strong> {new Date(+bookingData.date).toLocaleDateString('vi-VN')}</p>
                    <p><strong>⏰ Khung giờ:</strong> {time.valueVi}</p>
                    <p><strong>📦 Gói khám:</strong> {pkg.name}</p>
                    <p><strong>🏢 Cơ sở:</strong> {clinic.name} - {clinic.address}</p>
                    <p><strong>📄 Lý do khám:</strong> {bookingData.reason}</p>
                    <p><strong>💰 Đặt cọc:</strong> {bookingData.depositAmount ? `${bookingData.depositAmount.toLocaleString()} VND` : 'Không yêu cầu'}</p>
                    <p><strong>📌 Trạng thái:</strong> {status.valueVi}</p>
                </>
            );
        } else {
            return <p className="text-red-600">Loại QR không xác định.</p>;
        }
    };

    render() {
        const { qrContent, bookingData, error } = this.state;

        return (
            <>
                <HomeHeader />
                <div className="verify-email-container">
                    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow">
                        <h2 className="text-2xl font-bold mb-4 text-center">🔍 Kiểm tra thông tin đặt khám</h2>

                        <textarea
                            className="w-full border rounded p-2 mb-3 text-sm text-gray-600 bg-gray-100"
                            rows={3}
                            disabled
                            value={qrContent}
                        />

                        {error && <p className="text-red-600 mt-3">{error}</p>}

                        {bookingData && (
                            <div className="mt-5 p-4 border rounded bg-gray-50">
                                {this.renderBookingInfo()}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

export default connect()(QrCheck);
