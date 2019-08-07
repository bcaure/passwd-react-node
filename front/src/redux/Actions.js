import { manageError, processHttpStatus } from '../lib/errors';
import { 
  SUBMIT_LOGIN_SUCCESS, 
  SUBMIT_LOGIN_FAILURE, 
  READ_ACCOUNTS_SUCCESS, 
  READ_ACCOUNTS_FAILURE, 
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAILURE,
  CREATE_ACCOUNT_SUCCESS,
  CREATE_ACCOUNT_FAILURE,
  UPDATE_ACCOUNT_SUCCESS,
  UPDATE_ACCOUNT_FAILURE,
  UPDATE_FILTER_VALUE,
  UPDATE_FILTER_TIMEOUT
} from './ActionTypes';
import authHeader from '../lib/auth-headers';

const url = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const postRequest = {
  headers: {
    'content-type': 'application/json'  
  },
  method: 'POST'
};
const putRequest = {
  headers: {
    'content-type': 'application/json'
  },
  method: 'PUT'
};
const deleteRequest = {
  headers: {
    'content-type': 'application/json'  
  },
  method: 'DELETE'
};

///
/// LOGIN ACTIONS
///

export const submitLogin = (username, password) => { return (dispatch, getState) => {
  const post = {...postRequest, body: JSON.stringify({ username, password})};
  fetch(`${url}/login`, post)
  .then(response => processHttpStatus(response))
  .then(json => dispatch(submitLoginSuccess(username, json.token)))
  .then(() => dispatch(readAccounts(null)))
  .catch(error => manageError(error)
  .then(message => dispatch(submitLoginFailure(message))));
}};
export const submitLoginSuccess = (username, token) => ({
  type: SUBMIT_LOGIN_SUCCESS,
  payload: {username, token}
});
export const submitLoginFailure = message => ({
  type: SUBMIT_LOGIN_FAILURE,
  payload: { message }
});

///
/// CREATE ACTIONS
///

export const createAccount = account => (dispatch, getState) => {

  const post = {...postRequest, body: JSON.stringify(account)};
  fetch(`${url}/password`, authHeader(getState().connectedUser.token, post))
    .then(response => processHttpStatus(response))
    .then(() => dispatch(createAccountSuccess(account)))
    .catch(error => manageError(error)
    .then(message => dispatch(createAccountFailure(message))));
};

export const createAccountSuccess = account => ({
  type: CREATE_ACCOUNT_SUCCESS,
  payload: { account }
});

export const createAccountFailure = message => ({
  type: CREATE_ACCOUNT_FAILURE,
  payload: { message }
});

///
/// READ ACTIONS
///

export const readAccounts = searchFilter => (dispatch, getState) => {
  const readUrl = searchFilter ? `${url}/password?search=${encodeURIComponent(searchFilter)}` : `${url}/password`;
  fetch(readUrl, authHeader(getState().connectedUser.token))
    .then(response => processHttpStatus(response))
    .then(json => dispatch(readAccountsSuccess(json)))
    .catch(error => manageError(error)
    .then(message => dispatch(readAccountsFailure(message))));
}

export const readAccountsSuccess = accounts => ({
  type: READ_ACCOUNTS_SUCCESS,
  payload: { accounts }
});

export const readAccountsFailure = () => ({
  type: READ_ACCOUNTS_FAILURE
});

export const searchAccounts = searchFilter => (dispatch, getState) => {
  if (searchFilter !== getState().accountList.previousFilterValue) {
    dispatch(updateFilterTimeout());
    clearTimeout(getState().accountList.filterInputTimeout);
    const timer = setTimeout(() => {
      dispatch(readAccounts(searchFilter));
    }, 2000);
    dispatch(updateFilterValue(searchFilter));
    dispatch(updateFilterTimeout(timer));
  }
};

export const updateFilterValue = filterValue => ({
  type: UPDATE_FILTER_VALUE,
  payload: { filterValue }
});

export const updateFilterTimeout = filterTimeout => ({
  type: UPDATE_FILTER_TIMEOUT,
  payload: { filterTimeout }
});

///
/// UPDATE ACTIONS
///

export const updateAccount = (index, account) => (dispatch, getState) => {
  const put = {...putRequest, body: JSON.stringify(account)};
  fetch(`${url}/password`, authHeader(getState().connectedUser.token, put))
  .then(response => processHttpStatus(response))
  .then(() => dispatch(updateAccountSuccess(index, account)))
  .catch(error => manageError(error)
  .then(message => dispatch(updateAccountFailure(message))));
};

export const updateAccountSuccess = (index, account) => ({
  type: UPDATE_ACCOUNT_SUCCESS,
  payload: { index, account }
});

export const updateAccountFailure = message => ({
  type: UPDATE_ACCOUNT_FAILURE,
  payload: { message }
});

///
/// DELETE ACTIONS
///

export const deleteAccount = index => (dispatch, getState) => {
  const delete_ = {...deleteRequest};
  fetch(`${url}/password/${getState().accountList.accounts[index].id}`, authHeader(getState().connectedUser.token, delete_))
  .then(response => processHttpStatus(response))
  .then(() => dispatch(deleteAccountSuccess(index)))
  .catch(error => manageError(error)
  .then(message => dispatch(deleteAccountFailure(message))));
};

export const deleteAccountSuccess = index => ({
  type: DELETE_ACCOUNT_SUCCESS,
  payload: { index }
});

export const deleteAccountFailure = message => ({
  type: DELETE_ACCOUNT_FAILURE,
  payload: { message }
});




