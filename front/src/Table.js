import React, { Component } from 'react';
import Row from './Row';
import './Table.css';

export default class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            newRow: null
        };
    }

    handleRowEdit(index) {
        if (this.state.selected !== index) {
            this.setState({ selected: index, newRow: null });
        }
    }

    handleRowCancelEdit(_index) {
        this.setState({ selected: null });
    }

    handleDelete(index) {
        this.setState({ selected: null });
        this.props.onDelete(index);
    }

    handleValidate(index, row) {
        this.setState({ selected: null });
        this.props.onValidate(index, row);
    }

    handleNewRow() {
        this.setState({ newRow: { name: '', username: '', url: '', password: '' }, selected: null });
    }

    handleCreate(row) {
        this.props.onCreate(row);
        this.setState({ newRow: null });
    }

    cancelCreate() {
        this.setState({ newRow: null });
    }

    render() {
        const table = this.props.accounts.map((account, index) => {
            return (
                <Row key={account.name} account={account} index={index}
                    edit={index === this.state.selected}
                    onEdit={() => this.handleRowEdit(index)}
                    onCancelEdit={(row) => this.handleRowCancelEdit(row)}
                    onDelete={() => this.handleDelete(index)}
                    onValidate={(row) => this.handleValidate(index, row)}>
                </Row>
            );
        });

        let lastRow = undefined;
        if (this.state.newRow) {
            lastRow = (
                <Row account={this.state.newRow} index={this.props.accounts.length + 1}
                    edit={true} create={true}
                    onEdit={() => { }}
                    onCancelEdit={(row) => this.handleRowCancelEdit(row)}
                    onDelete={() => this.cancelCreate()}
                    onValidate={(row) => this.handleCreate(row)}>
                </Row>
            );
        } else {
            lastRow = (
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
                {table}
                {lastRow}
            </div>
        );
    }
}