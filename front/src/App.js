import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Table from './Table';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [
        {
          url: 'https://google.com',
          username: 'ben',
          password: 'rezzsdsffd',
          name: 'Google'
        },
        {
          url: 'https://facebook.com',
          username: 'ben@ben.com',
          password: 'dsxxv',
          name: 'Facebook'
        },
        {
          url: 'https://twitter.com',
          username: 'ben@ben.com',
          password: 'dddddssss',
          name: 'Twitter'
        },
        {
          url: 'https://pinterest.com',
          username: 'ben@tutu.com',
          password: 'azzoodd',
          name: 'Pinterest'
        }
      ],
      username: null,
      authenticated: false
    };
  }

  login(username, password) {
    this.setState({authenticated: true, username});
  }

  handleDelete(index) {
    const accounts = this.state.accounts.slice();
    accounts.splice(index, 1);
    this.setState({accounts});
  }

  handleValidate(index, row) {
    const accounts = this.state.accounts.slice();
    accounts[index] = {...row};
    this.setState({selected: null, accounts});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {
            !this.state.authenticated && 
              (<Login onSubmit={(username, password) => this.login(username, password) }></Login>)
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
                   onValidate={(index, row) => this.handleValidate(index, row)}>
            </Table>
            )
        }

      </div>
    );
  }
}

export default App;
