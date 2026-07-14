import React, { Component } from 'react';
import './Login.css';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.usernameInput = React.createRef();
    this.passwordInput = React.createRef();
    this.state = {
      username: '',
      password: ''
    }
  }
  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    e.preventDefault(); 
    this.props.onSubmit(username, password);  
  }

  render() {
    return (
      <form id="login-form" className="flex-center flex-xs" onSubmit={e => this.handleSubmit(e)}>

        <input type="text" required placeholder="nom" name="username" data-testid="login-username" value={this.state.username}
          onChange={e => this.handleChange(e)}
          onKeyDown={e => { if (e.key === 'Enter') { this.props.onSubmit(this.state.username, this.state.password); } }} />

        <input type="password" required placeholder="mot de passe" name="password" data-testid="login-password" value={this.state.password}
          onChange={e => this.handleChange(e)}
          onKeyDown={e => { if (e.key === 'Enter') { this.props.onSubmit(this.state.username, this.state.password); } }} />

        <button type="submit" className="round flash" data-testid="login-submit">
          <i className="material-icons">done</i>
        </button>

      </form>
    );
  }
}


