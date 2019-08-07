import { combineReducers } from 'redux';
import accountList from './AccountList';
import connectedUser from './ConnectedUser';
import errorManagement from './ErrorManagement';

export default combineReducers({ accountList, connectedUser, errorManagement });
