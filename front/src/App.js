import React, { Component } from 'react';
import logo from './logo1.png';
import './App.css';
import Login from './Login';
import Table from './Table';
import { manageError, processHttpStatus } from './lib/errors';

const url = "http://localhost:3001";
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      username: null,
      token: null,
      globalError: null,
      filterInputTimeout: null, 
      previousFilterValue: ''
    };
  }

  componentDidMount() {

  }

  login(username, password) {
    this.setState({ globalError: null });
    const post = {...postRequest, body: JSON.stringify({username, password})};
    fetch(`${url}/login`, post)
      .then(response => processHttpStatus(response))
      .then(json => {
        this.setState({token: json.token});
        return fetch(`${url}/password`, this.authHeader())
      })
      .then(response => processHttpStatus(response))
      .then(json => this.setState({ accounts: json, username }))
      .catch(error => manageError(error).then(message => this.setState({ globalError: message })));
  }

  authHeader(options) {
    const authHeader = { 'Authorization': this.state.token };
    if (options) {
      if (options.headers) {
        options.headers = { ...options.headers, ...authHeader };
      } else {
        options.headers = authHeader;
      }
    } else {
      options = { headers: authHeader }
    }
    return options;
  }

  handleDelete(index) {
    this.setState({ globalError: null });
    const delete_ = {...deleteRequest};
    fetch(`${url}/password/${this.state.accounts[index].id}`, this.authHeader(delete_))
    .then(response => processHttpStatus(response))
    .then(() => {
        const accounts = this.state.accounts.slice();
        accounts.splice(index, 1);
        this.setState({ selected: null, accounts });
      })
    .catch(error => manageError(error).then(message => this.setState({ globalError: message })));
  }

  handleModify(index, account) {
    this.setState({ globalError: null });
    const put = {...putRequest, body: JSON.stringify(account)};
    fetch(`${url}/password`, this.authHeader(put))
    .then(response => processHttpStatus(response))
    .then(() => {
        const accounts = this.state.accounts.slice();
        accounts[index] = { ...account };
        this.setState({ accounts });
      })
    .catch(error => manageError(error).then(message => this.setState({ globalError: message })));
  }

  handleCreate(account) {
    this.setState({ globalError: null });
    const post = {...postRequest, body: JSON.stringify(account)};
    fetch(`${url}/password`, this.authHeader(post))
      .then(response => processHttpStatus(response))
      .then(() => {
        const accounts = this.state.accounts.slice();
        accounts.push(account);
        this.setState({ accounts });
      })
      .catch(error => manageError(error).then(message => this.setState({ globalError: message })));

  }

  handleFilterChanged(value) {
    this.setState({ globalError: null });
    if (value !== this.state.previousFilterValue) {
      clearTimeout(this.filterInputTimeout);
      const timer = setTimeout(() => {
        fetch(`${url}/password?search=${encodeURIComponent(value)}`, this.authHeader())
          .then(response => processHttpStatus(response))
          .then(json => this.setState({ accounts: json, username: this.state.username }))
          .catch(error => manageError(error).then(message => this.setState({ globalError: message })));
      }, 500);
      this.setState({filterInputTimeout: timer, previousFilterValue: value});
    }
  }

  render() {
    const initiales = this.state.username ? this.state.username.substring(0, 1).toUpperCase() : '';
    const messageClasses = `padding-small ${this.state.globalError ? ' danger' : ''}`;

    return (
      <div className="App">
        <header className="App-header">
          <div className="App-header-items">
            <img src={logo} className="App-logo" alt="logo" />
            {
              this.state.token &&
              (
              <div className="App-title flex wrap-reverse">
                <input type="text" id="search-filter" name="searchFilter" placeholder="Search..." onKeyUp={event => this.handleFilterChanged(event.target.value)} />
                <i className="secondary material-icons">person</i>
                <span title={this.state.username} className="badge flash">{initiales}</span>
                <i className="secondary material-icons">collections_bookmark</i>
                <span title={this.state.accounts.length + ' comptes'} className="badge round-badge flash">{this.state.accounts.length}</span>
              </div>)
            }
          </div>
        </header>
        <div className="App-body flex-column flex-center margin-small">
          <div className={messageClasses}>&nbsp;{this.state.globalError}</div>
          {
              !this.state.token &&
              (<Login onSubmit={(username, password) => this.login(username, password)}></Login>)
          }
          {
            this.state.token &&
            (
              <Table accounts={this.state.accounts}
                onDelete={(index) => this.handleDelete(index)}
                onValidate={(index, account) => this.handleModify(index, account)}
                onCreate={(account) => this.handleCreate(account)}>
              </Table>
            )
          }
        </div>
      </div>
    );
  }
}

export default App;
