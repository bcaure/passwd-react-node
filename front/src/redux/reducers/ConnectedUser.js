import { SUBMIT_LOGIN_SUCCESS } from '../ActionTypes';

const initialState = {
    username: null, token: null
};

export default function (state = initialState, action) {
    
    switch (action.type) {
        case SUBMIT_LOGIN_SUCCESS: 
            return { username: action.payload.username, token: action.payload.token, message: null};
        default:
            return state;
    }
}