import React, { Component } from 'react';
export default class Row extends Component {
    constructor(props) {
      super(props);
      this.state = {...props.account};
    }

    handleDelete(_event) {     
        this.props.onDelete();
    }
  
    handleEdit(_event) {
        this.props.onEdit();
    }

    cancelEdit(_event) {
        this.setState({...this.props.account});
        this.props.onCancelEdit();
        if (this.props.create) {
            this.props.onDelete();
        }
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleValidate(_event) {
        this.props.onValidate({...this.state});
    }

    render() {
        let fields = '';
        let buttons = '';
        let error = '';
        let classNames = 'relative card card'+(this.props.index%7);
        if (this.props.edit) {
            classNames += ' big';
        }

        if (this.props.edit || this.props.account.error) {
            fields = (
                <form name="rowForm" className="left wrap">
                    <input type="text" required placeholder="nom du site" name="name" value={this.state.name} onChange={(e) => this.handleChange(e)} />
                    <input type="text" required placeholder="url" name="url" value={this.state.url} onChange={(e) => this.handleChange(e)} />
                    <input type="text" required placeholder="nom d'utilisateur" name="username" value={this.state.username} onChange={(e) => this.handleChange(e)} />
                    <input type="text" required placeholder="mot de passe" name="password" value={this.state.password} onChange={(e) => this.handleChange(e)} />
                </form>
            );
            buttons = (
                <div className="absolute bottom-right flex-center">
                    <div className={'danger'}>{ this.props.account.error }</div>
                    <button className="round info" onClick={(event) => this.cancelEdit(event)}><i className="material-icons">clear</i></button>
                    <button className="round flash" onClick={(event) => this.handleValidate(event)}><i className="material-icons">done</i></button>
                </div>
            );
                      
        } else {
            buttons = (
                <div className="absolute bottom-right">
                    <button className="round danger" onClick={(event) => this.handleDelete(event)}><i className="material-icons">delete</i></button>
                    <button className="round flash" onClick={(event) => this.handleEdit(event)}><i className="material-icons">edit</i></button>
                </div>
            );
            fields = (
                <div className="site-name" onClick={() => window.open(this.props.account.url)}>{this.props.account.name}</div>
            );
            classNames += ' flex-center';
        }
        return (
            <div className="cell">
                <div className="col username">{this.props.account.username}</div>
                <div className={classNames}>
                    {fields}
                    {error}
                    {buttons}
                </div>
                <div className="col password">{this.props.account.password}</div>
            </div>
        );
    }
}