import React, { Component } from 'react';
import { connect } from "react-redux";
import { Route, Switch } from 'react-router';
import Header from '../containers/Header/Header';
import Manager_Booking from '../containers/System/Manager_Clinic/Manager_Booking';
import Clinic_By_Manager from '../containers/System/Manager_Clinic/Clinic_By_Manager';
import Schedule_By_Manager from '../containers/System/Manager_Clinic/Schedule_By_Manager';
import Booking_Clinic from '../containers/System/Manager_Clinic/Booking_Clinic';
import ExamPackage from '../containers/System/Manager_Clinic/ExamPackage';
import Schedule_Package from '../containers/System/Manager_Clinic/Schedule_Package';
import ManagePackagePatient from '../containers/System/Manager_Clinic/ManagePackagePatient';
import RecordPackage from '../containers/System/Manager_Clinic/RecordPackage';
import DepositReportManager from '../containers/System/Manager_Clinic/DepositReportManager';


class ManageClinic extends Component {
    render() {

        const { isLoggedIn } = this.props;
        return (
            <React.Fragment>
                {isLoggedIn && <Header />}
                <div className="system-container">
                    <div className="system-list">
                        <Switch>
                            <Route path="/manage/manage-booking" component={Manager_Booking} />
                            <Route path="/manage/clinic-by-manager" component={Clinic_By_Manager} />
                            <Route path="/manage/schedule-by-manager" component={Schedule_By_Manager} />
                            <Route path="/manage/booking" component={Booking_Clinic} />
                            <Route path="/manage/manage-package" component={ExamPackage} />
                            <Route path="/manage/schedule-package" component={Schedule_Package} />
                            <Route path="/manage/package-s2" component={ManagePackagePatient} />
                            <Route path="/manage/package-s3" component={RecordPackage} />
                            <Route path="/manage/deposit-report" component={DepositReportManager} />
                        </Switch>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        systemMenuPath: state.app.systemMenuPath,
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageClinic);
