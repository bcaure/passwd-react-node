import React, { Component } from 'react';
export default class Row extends Component {
    constructor(props) {
      super(props);
      this.state = {...props.account};
      this.state.edit = false;
    }

    handleDelete(event) {     
        this.props.onDelete();
    }
  
    handleEdit(event) {
        this.setState({edit: true});
    }

    cancelEdit(event) {
        this.setState({...this.props.account});
        this.setState({edit: false});
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleValidate(event) {
        this.setState({edit: false});
        this.props.onValidate({...this.state});
    }

    render() {
        let fields = '';
        let buttons = '';
        if (this.state.edit) {
            fields = (
                <form onSubmit={() => this.props.onSubmit(this.state.name, this.state.url, this.state.username, this.state.password)} 
                      className="wrap flex-center">
                    <input type="text" required placeholder="site name" name="name" value={this.state.name} onChange={(e) => this.handleChange(e)} />
                    <input type="text" required placeholder="site url" name="url" value={this.state.url} onChange={(e) => this.handleChange(e)} />
                    <input type="text" required placeholder="user name" name="username" value={this.state.username} onChange={(e) => this.handleChange(e)} />
                    <input type="text" required placeholder="password" name="password" value={this.state.password} onChange={(e) => this.handleChange(e)} />
                </form>
            );
            buttons = (
                <div className="absolute bottomright">
                    <button className="round danger" onClick={(event) => this.cancelEdit(event)}><i className="material-icons">clear</i></button>
                    <button className="round flash" onClick={(event) => this.handleValidate(event)}><i className="material-icons">done</i></button>
                </div>
            );            
        } else {
            let nameField = (<div className="col">{this.props.account.name}</div>);
            if (this.props.selected) {
                nameField = (
                    <div className="col flex-center">
                        <div className="site-name">{this.props.account.name}</div>
                        <a href={this.props.account.url}><i className="material-icons">exit_to_app</i></a>
                    </div>
                );
                buttons = (
                    <div className="absolute bottomright">
                        <button className="round danger" onClick={(event) => this.handleDelete(event)}><i className="material-icons">delete</i></button>
                        <button className="round flash" onClick={(event) => this.handleEdit(event)}><i className="material-icons">edit</i></button>
                    </div>
                );
            }
            fields = (
                <div>
                    {nameField}
                    <div className="col">{this.props.account.username}</div>
                    <div className="col">{this.props.account.password}</div>
                </div>
            );
        }
        return (
            <div className={'relative row row'+(this.props.index%2)+(this.props.selected?' big':'')} 
                 onClick={() => this.props.onClick()}>
                {fields}
                {buttons}
            </div>
        );
    }
}