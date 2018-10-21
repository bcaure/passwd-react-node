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
        <form className="wrap flex-center">
          <div>
            <input type="text" required placeholder="username" name="username"
              ref="usernameInput"
              value={this.state.username} onChange={(e) => this.handleChange(e)} />
            <input type="password" required placeholder="password" name="password" 
              ref="passwordInput"
              value={this.state.password} onChange={(e) => this.handleChange(e)} />
          </div>
          <div>
            <button className="round flash" onClick={(e) => this.validateAndSubmit(e)}><i className="material-icons">done</i></button>
          </div>
        </form>
      );
    }
  }