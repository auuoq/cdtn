import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

class Home extends Component {
    render() {
        const { isLoggedIn } = this.props;
        // Điều hướng về trang HomePage nếu đã đăng nhập, nếu không thì điều hướng đến trang đăng nhập
        let linkToRedirect = isLoggedIn ? '/home' : '/user-login';

        return (
            <Redirect to={linkToRedirect} />
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

export default connect(mapStateToProps)(Home);
