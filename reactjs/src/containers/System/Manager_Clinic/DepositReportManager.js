import React, { Component } from 'react';
import { connect } from "react-redux";
import { getDepositReportByManager } from '../../../services/userService';
import './DepositReportPage.scss';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

class DepositReportManagerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: '',
      to: '',
      loading: false,
      errorMessage: '',
      reportData: null,
    };
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  fetchReport = async () => {
    const { from, to } = this.state;
    const { userInfo } = this.props;

    if (!from || !to) {
      this.setState({ errorMessage: 'Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.' });
      return;
    }

    if (new Date(from) > new Date(to)) {
      this.setState({ errorMessage: 'Ngày bắt đầu không được sau ngày kết thúc.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', reportData: null });

    try {
      const response = await getDepositReportByManager(userInfo.id, from, to);
      if (response.errCode === 0) {
        this.setState({ reportData: response });
      } else {
        this.setState({ errorMessage: response.errMessage || 'Có lỗi khi tải báo cáo.' });
      }
    } catch (error) {
      this.setState({ errorMessage: 'Lỗi máy chủ khi tải báo cáo.' });
    } finally {
      this.setState({ loading: false });
    }
  }

  exportToExcel = () => {
    const { reportData } = this.state;
    if (!reportData || !reportData.clinicReport) return;

    const clinic = reportData.clinicReport;

    const summary = [
      {
        'Tên phòng khám': clinic.clinicInfo?.name || 'Không rõ',
        'Địa chỉ': clinic.clinicInfo?.address || 'Không rõ',
        'Tổng tiền CHƯA chuyển (VND)': clinic.totalAmount || 0,
      },
    ];

    const transactions = clinic.detailedTransactions.map(tx => ({
      'ID': tx.momoTransId,
      'Số tiền (VND)': tx.amount,
      'Trạng thái': tx.status,
      'Thời gian thanh toán': new Date(tx.paymentTime).toLocaleString(),
    }));

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    const wsTransactions = XLSX.utils.json_to_sheet(transactions);

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Quan');
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Chi Tiết Giao Dịch');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, `BaoCaoDatCoc_${clinic.clinicInfo?.name || 'phongkham'}.xlsx`);
  }

  render() {
    const { from, to, loading, errorMessage, reportData } = this.state;
    const clinicReport = reportData?.clinicReport;

    return (
      <div className="deposit-report-page">
        <h2>Báo Cáo Đặt Cọc (Phòng Khám Quản Lý)</h2>

        <div className="filters">
          <label>
            Từ ngày:{' '}
            <input
              type="date"
              name="from"
              value={from}
              onChange={this.handleInputChange}
            />
          </label>
          <label>
            Đến ngày:{' '}
            <input
              type="date"
              name="to"
              value={to}
              onChange={this.handleInputChange}
            />
          </label>
          <button onClick={this.fetchReport} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </button>
        </div>

        {errorMessage && <div className="error">{errorMessage}</div>}

        {clinicReport && (
          <div className="report-section">
            <h3>Khoảng thời gian: {reportData.reportPeriod.from} đến {reportData.reportPeriod.to}</h3>

            <h4>Thông tin phòng khám</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tên phòng khám</th>
                  <th>Địa chỉ</th>
                  <th>Tổng tiền CHƯA chuyển (VND)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{clinicReport.clinicInfo?.name || 'Không rõ'}</td>
                  <td>{clinicReport.clinicInfo?.address || 'Không rõ'}</td>
                  <td>{Number(clinicReport.totalAmount-clinicReport.totalAmount*20/100 || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <h4>Chi tiết giao dịch</h4>
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Số tiền (VND)</th>
                  <th>Trạng thái</th>
                  <th>Thời gian thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {clinicReport.detailedTransactions.length > 0 ? (
                  clinicReport.detailedTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.momoTransId}</td>
                      <td>{Number(tx.amount-(tx.amount*20/100)).toLocaleString()}</td>
                      <td>{tx.status}</td>
                      <td>{new Date(tx.paymentTime).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '20px' }}>
              <button onClick={this.exportToExcel}>Xuất Excel</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  language: state.app.language,
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(DepositReportManagerPage);
