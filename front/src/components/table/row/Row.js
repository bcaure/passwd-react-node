import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formChange, formInit } from '../../../redux/Actions';

class Row extends Component {

  componentDidMount() {
    if (this.props.edit) { // component mounted with edit = true : new row creation
      // there is only 1 state for all rows : 
      // do not edit form for existing rows
      // because it will replace values in the one unique state each time
      this.props.formInit(this.props.account);
    }
  }

  edit() {
    this.props.formInit(this.props.account);
    this.props.onEdit();
  }

  cancelEdit(_event) {
    this.props.formInit({ ...this.props.account });
    this.props.onCancelEdit();
    if (this.props.create) {
      this.props.onDelete();
    }
  }

  render() {
    let fields = '';
    let buttons = '';
    let error = '';
    let classNames = 'relative card existing-card card' + (this.props.index % 7);
    if (this.props.edit || this.props.account.error) {
      classNames += ' editing';
    }

    if (this.props.form && (this.props.edit || this.props.account.error)) {
      fields = (
        <form name="rowForm" className="left wrap">
          <input type="text" required placeholder="nom du site" name="name" value={this.props.form.name} onChange={(event) => this.props.formChange(event.target.name, event.target.value)} />
          <input type="text" required placeholder="url" name="url" value={this.props.form.url} onChange={(event) => this.props.formChange(event.target.name, event.target.value)} />
          <input type="text" required placeholder="nom d'utilisateur" name="username" value={this.props.form.username} onChange={(event) => this.props.formChange(event.target.name, event.target.value)} />
          <input type="text" required placeholder="mot de passe" name="password" value={this.props.form.password} onChange={(event) => this.props.formChange(event.target.name, event.target.value)} />
        </form>
      );
      buttons = (
        <div className="absolute bottom-right flex-center">
          <div className={'danger'}>{this.props.account.error}</div>
          <button className="round info" onClick={(event) => this.cancelEdit(event)}><i className="material-icons">clear</i></button>
          <button className="round flash" onClick={(_event) => this.props.onValidate({ ...this.props.form })}><i className="material-icons">done</i></button>
        </div>
      );

    } else {
      buttons = (
        <div className="absolute bottom-right">
          <button className="round danger" onClick={(_event) => this.props.onDelete()}><i className="material-icons">delete</i></button>
          <button className="round flash" onClick={(_event) => this.edit()}><i className="material-icons">edit</i></button>
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

const mapStateToProps = state => {
  return {
    form: state.formManagement.account
  };
};

const mapDispatchToProps = {
  formChange,
  formInit
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Row);