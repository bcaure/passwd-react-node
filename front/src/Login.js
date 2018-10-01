import React, { Component } from 'react';
import './Login.css';

export default class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
        username: '',
        password: ''
      }
    }
    handleChange(e) {
      this.setState({[e.target.name]: e.target.value});
    }
  
    render() {
      return (
        <form className="wrap flex-center">
          <div>
            <input type="text" required placeholder="username" name="username" value={this.state.username} onChange={(e) => this.handleChange(e)} />
            <input type="password" required placeholder="password" name="password" value={this.state.password} onChange={(e) => this.handleChange(e)} />
          </div>
          <div>
            <button type="button" className="round flash" onClick={() => this.props.onSubmit(this.state.username, this.state.password)}><i className="material-icons">done</i></button>
          </div>
        </form>
      );
    }
  }