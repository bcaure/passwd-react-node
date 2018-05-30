import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class Login extends Component {
  submit() {
    
  }
  render() {
    return (
      <form submit={this.submit()}>
        <div>
          <input type="text" required placeholder="login" />
        </div>
        <div>
          <input type="password" required placeholder="password" />
        </div>
        <div>
          <input type="submit" value="OK" />
        </div>
      </form>
    );
  }
}

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
        }
      ],
      authenticated: false
    };
  }
  login() {
    this.setState({authenticated: true});
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{this.state.accounts.length} login/passwords!</h1>
        </header>
        {
          this.state.authenticated && 
            (<p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>)
        }
        {
          !this.state.authenticated && 
            (<Login onSubmit={(username, password) => this.login(username, password) }></Login>)
        }

      </div>
    );
  }
}

export default App;
