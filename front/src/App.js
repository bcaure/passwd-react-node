import React, { Component } from 'react';
import logo from './logo.png';
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      username: null,
      token: null,
      globalError: null
    };
  }

  componentDidMount() {

  }

  login(username, password) {
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
    fetch(`${url}/password/${this.state.accounts[index].name}`, this.authHeader())
    .then(response => processHttpStatus(response))
    .then(() => {
        const accounts = this.state.accounts.slice();
        accounts.splice(index, 1);
        this.setState({ selected: null, accounts });
      })
    .catch(error => manageError(error).then(message => this.setState({ globalError: message })));
  }

  handleModify(index, account) {

    const put = {...putRequest};
    putRequest.body = JSON.stringify(account);

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

    // post new row
    const post = {...postRequest};
    post.body = JSON.stringify(account);

    fetch(`${url}/password`, this.authHeader(post))
      .then(response => processHttpStatus(response))
      .then(() => {
        const accounts = this.state.accounts.slice();
        accounts.push(account);
        this.setState({ accounts });
      })
      .catch(error => manageError(error).then(message => this.setState({ globalError: message })));

  }

  render() {
    const initiales = this.state.username ? this.state.username.substring(0, 1).toUpperCase() : '';
    const messageClasses = `padding-small margin-small${this.state.globalError ? ' danger' : ''}`;

    return (
      <div className="App">
        <header className="App-header">
          <div className="App-header-items">
            <img src={logo} className="App-logo" alt="logo" />
            {
              !this.state.token &&
              (<Login onSubmit={(username, password) => this.login(username, password)}></Login>)
            }
            {
              this.state.token &&
              (<div className="App-title flex">
                <i className="secondary material-icons">person</i>
                <span className="badge flash">{initiales}</span>
                <i className="secondary material-icons">collections_bookmark</i>
                <span className="badge round-badge flash">{this.state.accounts.length}</span>
              </div>)
            }
          </div>
        </header>
        <div className="App-body">
          <div className={messageClasses}>&nbsp;{this.state.globalError}</div>
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
