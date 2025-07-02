import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  getDepositReport,
  getDepositReportByClinic,
  getAllClinic,
  toggleStatusForClinic,
  toggleTransactionStatus
} from '../../../services/userService';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import './DepositReportPage.scss';

class DepositReportPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: '',
      to: '',
      selectedClinicId: 'ALL',
      loading: false,
      errorMessage: '',
      reportData: null,
      clinics: [],
      expandedClinicIds: []
    };
  }

  async componentDidMount() {
    try {
      const res = await getAllClinic();
      if (res.errCode === 0) {
        this.setState({ clinics: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch clinics');
    }
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  toggleExpandClinic = (clinicId) => {
    this.setState(prevState => {
      const expanded = [...prevState.expandedClinicIds];
      const index = expanded.indexOf(clinicId);
      if (index > -1) {
        expanded.splice(index, 1);
      } else {
        expanded.push(clinicId);
      }
      return { expandedClinicIds: expanded };
    });
  }

  fetchReport = async () => {
    const { from, to, selectedClinicId } = this.state;

    if (!from || !to) {
      this.setState({ errorMessage: 'Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.' });
      return;
    }

    if (new Date(from) > new Date(to)) {
      this.setState({ errorMessage: 'Ngày bắt đầu không được sau ngày kết thúc.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', reportData: null, expandedClinicIds: [] });

    try {
      let response;
      if (selectedClinicId === 'ALL') {
        response = await getDepositReport(from, to);
      } else {
        response = await getDepositReportByClinic(selectedClinicId, from, to);
      }

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

  handleToggleTransactionStatus = async (transactionId) => {
    await toggleTransactionStatus(transactionId);
    this.fetchReport();
  }

  handleToggleClinicStatus = async (clinicId) => {
    const { from, to } = this.state;
    await toggleStatusForClinic(clinicId, from, to);
    this.fetchReport();
  }

  exportToExcel = () => {
    const { reportData, selectedClinicId } = this.state;

    if (!reportData) return;

    let wb = XLSX.utils.book_new();

    if (selectedClinicId === 'ALL') {
      // Sheet tổng hợp
      const clinicSummary = reportData.clinicReports?.map(item => ({
        'Tên phòng khám': item.clinicInfo?.name || '',
        'Địa chỉ': item.clinicInfo?.address || '',
        'Tổng tiền (VND)': item.totalAmount || 0
      })) || [];

      const summarySheet = XLSX.utils.json_to_sheet(clinicSummary);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng hợp phòng khám');

      reportData.clinicReports?.forEach(item => {
        const txs = item.detailedTransactions?.map(tx => ({
          'TransID': tx.momoTransId,
          'Số tiền (VND)': tx.amount,
          'Trạng thái': tx.status,
          'Thời gian thanh toán': new Date(tx.paymentTime).toLocaleString()
        })) || [];

        if (txs.length > 0) {
          const sheet = XLSX.utils.json_to_sheet(txs);
          const sheetName = item.clinicInfo?.name?.substring(0, 31) || `Clinic ${item.clinicId}`;
          XLSX.utils.book_append_sheet(wb, sheet, sheetName);
        }
      });
    } else {
      const clinicInfoSheet = XLSX.utils.json_to_sheet([
        {
          'Tên phòng khám': reportData.clinicInfo?.name || '',
          'Địa chỉ': reportData.clinicInfo?.address || '',
          'Tổng tiền (VND)': reportData.totalAmount || 0
        }
      ]);
      XLSX.utils.book_append_sheet(wb, clinicInfoSheet, 'Thông tin tổng hợp');

      const txs = reportData.detailedTransactions?.map(tx => ({
        'TransID': tx.momoTransId,
        'Số tiền (VND)': tx.amount,
        'Trạng thái': tx.status,
        'Thời gian thanh toán': new Date(tx.paymentTime).toLocaleString()
      })) || [];

      const detailSheet = XLSX.utils.json_to_sheet(txs);
      XLSX.utils.book_append_sheet(wb, detailSheet, 'Chi tiết giao dịch');
    }

    const fileName = `Deposit_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  }

  render() {
    const { from, to, selectedClinicId, loading, errorMessage, reportData, clinics, expandedClinicIds } = this.state;

    return (
      <div className="deposit-report-page">
        <h2>Báo Cáo Đặt Cọc</h2>

        <div className="filters">
          <label>
            Từ ngày:{' '}
            <input type="date" name="from" value={from} onChange={this.handleInputChange} />
          </label>
          <label>
            Đến ngày:{' '}
            <input type="date" name="to" value={to} onChange={this.handleInputChange} />
          </label>
          <label>
            Phòng khám:{' '}
            <select name="selectedClinicId" value={selectedClinicId} onChange={this.handleInputChange}>
              <option value="ALL">Tất cả</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </label>
          <button onClick={this.fetchReport} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </button>
          <button onClick={this.exportToExcel} disabled={!reportData || loading}>
            Xuất Excel
          </button>
        </div>

        {errorMessage && <div className="error">{errorMessage}</div>}

        {reportData && (
          <div className="report-section">
            <h3>Khoảng thời gian: {reportData.reportPeriod?.from} đến {reportData.reportPeriod?.to}</h3>

            {selectedClinicId === 'ALL' && (
              <>
                <h4>Tổng tiền theo phòng khám</h4>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Tên phòng khám</th>
                      <th>Địa chỉ</th>
                      <th>Tổng tiền (VND)</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.clinicReports?.length > 0 ? (
                      reportData.clinicReports.map(item => (
                        <React.Fragment key={item.clinicId}>
                          <tr>
                            <td>{item.clinicInfo?.name || 'Không rõ'}</td>
                            <td>{item.clinicInfo?.address || 'Không rõ'}</td>
                            <td>{Number(item.totalAmount).toLocaleString()}</td>
                            <td>
                              <button onClick={() => this.toggleExpandClinic(item.clinicId)}>
                                {expandedClinicIds.includes(item.clinicId) ? 'Ẩn chi tiết' : 'Chi tiết'}
                              </button>
                              <button onClick={() => this.handleToggleClinicStatus(item.clinicId)} style={{ marginLeft: 10 }}>
                                Đã hoàn trả
                              </button>
                            </td>
                          </tr>
                          {expandedClinicIds.includes(item.clinicId) && (
                            <tr>
                              <td colSpan="4">
                                <h5>Chi tiết giao dịch - {item.clinicInfo?.name}</h5>
                                <table className="report-table">
                                  <thead>
                                    <tr>
                                      <th>TransId</th>
                                      <th>Số tiền (VND)</th>
                                      <th>Trạng thái</th>
                                      <th>Thời gian thanh toán</th>
                                      <th>Hành động</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.detailedTransactions?.length > 0 ? (
                                      item.detailedTransactions.map(tx => (
                                        <tr key={tx.id}>
                                          <td>{tx.momoTransId}</td>
                                          <td>{Number(tx.amount).toLocaleString()}</td>
                                          <td>{tx.status}</td>
                                          <td>{new Date(tx.paymentTime).toLocaleString()}</td>
                                          <td>
                                            {tx.status === 'PENDING' ? (
                                              <button onClick={() => this.handleToggleTransactionStatus(tx.id)}>
                                                Xác nhận đã hoàn trả
                                              </button>
                                            ) : (
                                              <button onClick={() => this.handleToggleTransactionStatus(tx.id)}>Đã hoàn trả</button>
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr><td colSpan="5">Không có dữ liệu</td></tr>
                                    )}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr><td colSpan="4">Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

            {selectedClinicId !== 'ALL' && (
              <>
                <h4>Tổng tiền</h4>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Tên phòng khám</th>
                      <th>Địa chỉ</th>
                      <th>Tổng tiền (VND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{reportData.clinicInfo?.name || 'Không rõ'}</td>
                      <td>{reportData.clinicInfo?.address || 'Không rõ'}</td>
                      <td>{Number(reportData.totalAmount).toLocaleString()}</td>
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
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.detailedTransactions?.length > 0 ? (
                      reportData.detailedTransactions.map(tx => (
                        <tr key={tx.id}>
                          <td>{tx.id}</td>
                          <td>{Number(tx.amount).toLocaleString()}</td>
                          <td>{tx.status}</td>
                          <td>{new Date(tx.paymentTime).toLocaleString()}</td>
                          <td>
                            <button onClick={() => this.handleToggleTransactionStatus(tx.id)}>
                              Đã hoàn trả
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5">Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  language: state.app.language,
});

export default connect(mapStateToProps)(DepositReportPage);
