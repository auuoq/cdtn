import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from "../../../store/actions";

class TableManageUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usersRedux: []
        }
    }

    componentDidMount() {
        this.props.fetchUserRedux();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.listUsers !== this.props.listUsers) {
            this.setState({
                usersRedux: this.props.listUsers
            });
        }
    }

    handleDeleteUser = (user) => {
        if (window.confirm(`Are you sure you want to delete user ${user.email}?`)) {
            this.props.deleteAUserRedux(user.id);
        }
    }

    handleEditUser = (user) => {
        this.props.handleEditUserFromParentKey(user);
    }

    render() {
        let arrUsers = this.state.usersRedux;

        return (
            <div className="user-management-container">
                <div className="user-table-wrapper">
                    <table className="user-management-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Address</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arrUsers && arrUsers.length > 0 ? (
                                arrUsers.map((item, index) => (
                                    <tr key={index}>
                                        <td data-label="Email">{item.email}</td>
                                        <td data-label="First Name">{item.firstName}</td>
                                        <td data-label="Last Name">{item.lastName}</td>
                                        <td data-label="Address">{item.address}</td>
                                        <td data-label="Phone">{item.phonenumber}</td>
                                        <td data-label="Actions">
                                            <div className='action-buttons'>
                                                <button
                                                    onClick={() => this.handleEditUser(item)}
                                                    className="btn-edit"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => this.handleDeleteUser(item)}
                                                    className="btn-delete"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="no-data">
                                    <td colSpan="6">
                                        <div className="no-data-content">
                                            <i className="fas fa-user-slash no-data-icon"></i>
                                            <p>No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        listUsers: state.admin.users
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),
        deleteAUserRedux: (id) => dispatch(actions.deleteAUser(id))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);