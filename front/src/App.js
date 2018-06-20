import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Table from './Table';

const url = "http://localhost:3001";
const request = {
  headers: {
    'user-agent': 'Mozilla/4.0 MDN Example',
    'content-type': 'application/json'
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      username: null,
      authenticated: false,
      globalError: null
    };
  }

  componentDidMount() {
    fetch(`${url}/password`)
      .then(res => res.json())
      .then(
        (accounts) => this.setState({ accounts }),
        (globalError) => this.setState({ globalError })
      );
  }

  login(username, password) {
    this.setState({ authenticated: true, username });
  }

  handleDelete(index) {
    fetch(`${url}/password/${this.state.accounts[index].name}`).then(
      (success) => {
        const accounts = this.state.accounts.slice();
        accounts.splice(index, 1);
        this.setState({ selected: null, accounts });
      },
      (globalError) => this.setState({ globalError })
    );

  }

  handleModify(index, account) {
    const putRequest = { ...request };
    putRequest.body = JSON.stringify(account);
    putRequest.method = 'PUT';

    fetch(`${url}/password`, putRequest).then(
      (success) => {
        const accounts = this.state.accounts.slice();
        accounts[index] = { ...account };
        this.setState({ accounts });
      },
      (globalError) => this.setState({ globalError })
    );
  }

  handleCreate(account) {

    // post new row
    const postRequest = { ...request };
    postRequest.body = JSON.stringify(account);
    postRequest.method = 'POST';

    fetch(`${url}/password`, postRequest).then(
      (success) => {
        const accounts = this.state.accounts.slice();
        accounts.push(account);
        this.setState({ accounts });
      },
      (globalError) => this.setState({ globalError })
    );

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {
            !this.state.authenticated &&
            (<Login onSubmit={(username, password) => this.login(username, password)}></Login>)
          }
          {
            this.state.authenticated &&
            (<h1 className="App-title">{this.state.accounts.length} login/passwords!</h1>)
          }
        </header>
        {
          this.state.authenticated &&
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
