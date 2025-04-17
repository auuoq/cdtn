import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router';
import Header from '../containers/Header/Header';
import Manager_Booking from '../containers/System/Manager_Clinic/Manager_Booking';
import Clinic_By_Manager from '../containers/System/Manager_Clinic/Clinic_By_Manager';
import Schedule_By_Manager from '../containers/System/Manager_Clinic/Schedule_By_Manager';
import Booking_Clinic from '../containers/System/Manager_Clinic/Booking_Clinic';


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
