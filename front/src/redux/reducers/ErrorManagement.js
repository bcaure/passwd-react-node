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
} from '../ActionTypes';

const initialState = {
  message: null
};

export default function (state = initialState, action) {

  switch (action.type) {
    case SUBMIT_LOGIN_FAILURE:
    case READ_ACCOUNTS_FAILURE:
    case DELETE_ACCOUNT_FAILURE:
    case CREATE_ACCOUNT_FAILURE:
    case UPDATE_ACCOUNT_FAILURE:
      return { message: action.payload.message };
    case SUBMIT_LOGIN_SUCCESS:
    case READ_ACCOUNTS_SUCCESS:
    case DELETE_ACCOUNT_SUCCESS:
    case CREATE_ACCOUNT_SUCCESS:
    case UPDATE_ACCOUNT_SUCCESS:
      return { message: null }
    default:
      return state;
  }
}
