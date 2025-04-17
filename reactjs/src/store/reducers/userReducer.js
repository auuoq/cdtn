import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false, // Trạng thái đăng nhập cho Admin/Doctor
    userInfo: null,
    isLoggedInPatient: false, // Trạng thái đăng nhập cho Patient
    patientInfo: null
};

const appReducer = (state = initialState, action) => {
    switch (action.type) {
        // Admin/Doctor login/logout
        case actionTypes.USER_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true,
                userInfo: action.userInfo
            };
        case actionTypes.USER_LOGIN_FAIL:
        case actionTypes.PROCESS_LOGOUT:
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            };

        // Patient login/logout
        case actionTypes.PATIENT_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedInPatient: true,
                patientInfo: action.patientInfo
            };
        case actionTypes.PATIENT_LOGIN_FAIL:
        case actionTypes.PROCESS_PATIENT_LOGOUT:
            return {
                ...state,
                isLoggedInPatient: false,
                patientInfo: null
            };

        default:
            return state;
    }
};

export default appReducer;
