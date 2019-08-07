import { READ_ACCOUNTS_SUCCESS, DELETE_ACCOUNT_SUCCESS, CREATE_ACCOUNT_SUCCESS, UPDATE_ACCOUNT_SUCCESS, UPDATE_FILTER_VALUE, UPDATE_FILTER_TIMEOUT } from "../ActionTypes";

const initialState = {
    selected: null,
    accounts: [],
    previousFilterValue: null,
    filterInputTimeout: null
};

export default function (state = initialState, action) {
    const accounts = state.accounts.slice();
    switch (action.type) {
        case CREATE_ACCOUNT_SUCCESS:
            accounts.push({ ...action.payload.account });
            return {  ...state, selected: state.selected, accounts };
        case READ_ACCOUNTS_SUCCESS:
            state = {  ...state, accounts: action.payload.accounts, selected: null }
            return state;
        case UPDATE_ACCOUNT_SUCCESS:
            accounts[action.payload.index] = { ...action.payload.account };
            return { ...state, accounts };
        case DELETE_ACCOUNT_SUCCESS:
            accounts.splice(action.payload.index, 1);
            return { ...state, selected: null, accounts };
        case UPDATE_FILTER_VALUE:
            return { ...state, previousFilterValue: action.payload.filterValue };
        case UPDATE_FILTER_TIMEOUT:
            return { ...state, filterInputTimeout: action.payload.filterTimeout };
        default:
            return state;
    }
}