import React, { Component } from 'react';
import { connect } from 'react-redux';
import Row from './row/Row';
import './Table.css';
import { selectRow, updateNewRow } from '../../redux/Actions';

class Table extends Component {

  handleRowEdit(index) {
    if (this.props.selected !== index) {
      this.props.selectRow(index);
      this.props.updateNewRow(null);
    }
  }

  handleDelete(index) {
    this.props.selectRow(null);
    this.props.onDelete(index);
  }

  handleValidate(index, row) {
    this.props.selectRow(null);
    this.props.onValidate(index, row);
  }

  handleNewRow() {
    this.props.selectRow(null);
    this.props.updateNewRow({ name: '', username: '', url: '', password: '' });
  }

  handleCreate(row) { 
    this.props.onCreate(row);
    this.props.updateNewRow(null);
    this.props.selectRow(null);
  }

  render() {
    const table = this.props.accounts.map((account, index) => {
      return (
        <Row key={account.name} account={account} index={index}
          edit={index === this.props.selected}
          onEdit={() => this.handleRowEdit(index)}
          onCancelEdit={_row => this.props.selectRow(null)}
          onDelete={() => this.handleDelete(index)}
          onValidate={(row) => this.handleValidate(index, row)}>
        </Row>
      );
    });

    let addCardButton = undefined;
    if (this.props.newRow) {
      addCardButton = (
        <Row account={this.props.newRow} index={this.props.accounts.length + 1}
          edit={true} create={true}
          onEdit={() => { }}
          onCancelEdit={(row) => this.props.selectRow(null)}
          onDelete={() => this.props.updateNewRow(null) }
          onValidate={(row) => this.handleCreate(row)}>
        </Row>
      );
    } else {
      addCardButton = (
        <div className="cell">
          <div className="col username">&nbsp;</div>
          <div className={'relative flex-center add card card' + (this.props.accounts.length % 2)}
            onClick={() => this.handleNewRow()}>
            <i className="material-icons">add</i>
          </div>
          <div className="col password">&nbsp;</div>
        </div>
      );
    }
    return (
      <div className="table flex wrap">
        {addCardButton}
        {table}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    selected: state.accountList.selected,
    newRow: state.accountList.newRow
  };
};

const mapDispatchToProps = {
  selectRow, updateNewRow
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Table);
