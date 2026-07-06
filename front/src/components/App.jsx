import React from 'react';
import { connect } from 'react-redux';
import { submitLogin, createAccount, readAccounts, updateAccount, deleteAccount, searchAccounts } from '../redux/Actions';
import logo from '../logo.png';
import './App.css';
import Login from './login/Login';
import Table from './table/Table';

export const App = props => {
  const initiales = props.username ? props.username.substring(0, 1).toUpperCase() : '';
  const messageClasses = `padding-small ${props.message ? ' danger' : ''}`;

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-items">
          <img src={logo} className="App-logo" alt="logo" />
          {
            props.token &&
            (
              <div className="App-title flex wrap-reverse">
                <input type="text" id="search-filter" name="searchFilter" placeholder="Search..." onKeyUp={event => props.searchAccounts(event.target.value)} />
                <i className="secondary material-icons">person</i>
                <span title={props.username} className="badge flash">{initiales}</span>
                <i className="secondary material-icons">collections_bookmark</i>
                <span title={props.accounts.length + ' comptes'} className="badge round-badge flash">{props.accounts.length}</span>
              </div>)
          }
        </div>
      </header>
      <div className="App-body flex-column flex-center margin-small">
        <div className={messageClasses}>&nbsp;{props.message}</div>
        {
          !props.token &&
          (<Login onSubmit={(username, password) => props.submitLogin(username, password)}></Login>)
        }
        {
          props.token &&
          (
            <Table accounts={props.accounts}
              onDelete={(index) => props.deleteAccount(index)}
              onValidate={(index, account) => props.updateAccount(index, account)}
              onCreate={(account) => props.createAccount(account)}>
            </Table>
          )
        }
      </div>
    </div>
  );
};


const mapStateToProps = state => {
  return {
    username: state.connectedUser.username,
    token: state.connectedUser.token,
    message: state.errorManagement.message,
    accounts: state.accountList.accounts
  };
};

const mapDispatchToProps = {
  submitLogin,
  createAccount,
  readAccounts,
  updateAccount,
  deleteAccount,
  searchAccounts
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
