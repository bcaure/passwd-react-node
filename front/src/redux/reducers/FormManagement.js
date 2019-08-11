import { FORM_CHANGE, FORM_INIT } from "../ActionTypes";

const initialState = {
    account: null
};

export default function (state = initialState, action) {
    switch (action.type) {
        case FORM_CHANGE:
            return { account: {  ...state.account, [action.payload.name]: action.payload.value } };
        case FORM_INIT:
            return { account: action.payload.account };
        default:
            return state;
    }
}