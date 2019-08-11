import { combineReducers } from 'redux';
import accountList from './AccountList';
import connectedUser from './ConnectedUser';
import errorManagement from './ErrorManagement';
import formManagement from './FormManagement';

export default combineReducers({ accountList, connectedUser, errorManagement, formManagement });
