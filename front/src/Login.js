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
      this.setState({[e.target.name]: e.target.value});
    }

    validateAndSubmit(e) {
      if (Object.values(this.refs).reduce((prev, curr) => prev && curr.checkValidity())) {
        this.props.onSubmit(this.state.username, this.state.password);
      }
    }
  
    render() {
      return (
        <form id="login-form" className="flex-center flex-xs">
          
          <input type="text" required placeholder="nom" name="username" value={this.state.username} 
            onChange={e => this.handleChange(e)} 
            onKeyPress={e => { if (e.which === 13) { this.props.onSubmit(this.state.username, this.state.password); return false; } } } />
          
          <input type="password" required placeholder="mot de passe" name="password" value={this.state.password} 
            onChange={e => this.handleChange(e)}
            onKeyPress={e => { if (e.which === 13) { this.props.onSubmit(this.state.username, this.state.password); return false; } } } />
          
          <button type="button" className="round flash" onClick={() => this.props.onSubmit(this.state.username, this.state.password)}>
            <i className="material-icons">done</i>
          </button>
        
        </form>
      );
    }
  }