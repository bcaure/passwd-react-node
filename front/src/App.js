import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Table from './Table';

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
      .then(response => response.json())
      .then(json => {
        console.log(JSON.stringify(json));
        this.setState({token: json.token});
        return fetch(`${url}/password`)
      })
      .then(response => response.json())
      .then(json => this.setState({ accounts: json }))
      .catch(error => {
        console.error(error);
        this.setState({ globalError: error.msg });
      });
  }

  handleDelete(index) {
    fetch(`${url}/password/${this.state.accounts[index].name}`).then(
      (success) => {
        const accounts = this.state.accounts.slice();
        accounts.splice(index, 1);
        this.setState({ selected: null, accounts });
      },
      (error) => this.setState({ globalError: error.msg })
    );

  }

  handleModify(index, account) {

    const put = {...putRequest};
    putRequest.body = JSON.stringify(account);

    fetch(`${url}/password`, put).then(
      (success) => {
        const accounts = this.state.accounts.slice();
        accounts[index] = { ...account };
        this.setState({ accounts });
      },
      (error) => this.setState({ globalError: error.msg })
    );
  }

  handleCreate(account) {

    // post new row
    const post = {...postRequest};
    post.body = JSON.stringify(account);

    fetch(`${url}/password`, post).then(
      (success) => {
        const accounts = this.state.accounts.slice();
        accounts.push(account);
        this.setState({ accounts });
      },
      (error) => this.setState({ globalError: error.msg })
    );

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {
            !this.state.token &&
            (<Login onSubmit={(username, password) => this.login(username, password)}></Login>)
          }
          {
            this.state.token &&
            (<h1 className="App-title">{this.state.accounts.length} login/passwords!</h1>)
          }
        </header>
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
        <div className="{danger}">{this.state.globalError}</div>
      </div>
    );
  }
}

export default App;
