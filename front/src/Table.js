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

    handleRowClick(index) {
        if (this.state.selected !== index) {
            this.setState({ selected: index });
        }
    }

    handleDelete(index) {
        this.setState({ selected: null });
        this.props.onDelete(index);
    }

    handleValidate(index, row) {
        this.props.onValidate(index, row);
    }

    handleNewRow() {
        this.setState({newRow: {name: '', username: '', url: '', password: ''}, selected: null});
    }

    handleCreate(row) {
        // check for existing name
        if (this.props.accounts.find(account => account.name === row.name)) {
            row.error = 'Name already exists';
            this.setState({newRow: row});
        } else {      
            this.props.onCreate(row);
            this.setState({newRow: null});
        }
    }

    cancelCreate() {
        this.setState({newRow: null});
    }

    render() {
        const table = this.props.accounts.map((account, index) => {
            return <Row key={account.name} account={account} index={index} selected={index === this.state.selected}
                onClick={() => this.handleRowClick(index)}
                onDelete={() => this.handleDelete(index)}
                onValidate={(row) => this.handleValidate(index, row)}>
            </Row>
        });

        let lastRow = undefined;
        if (this.state.newRow) {
            lastRow = (
                <Row account={this.state.newRow} index={this.props.accounts.length+1} selected={true} create={true}
                    onClick={() => {}}
                    onDelete={() => this.cancelCreate()}
                    onValidate={(row) => this.handleCreate(row)}>
                </Row>
            );
        } else {
            lastRow = (
                <div className={'relative flex-center add row row' + (this.props.accounts.length % 2)}
                    onClick={() => this.handleNewRow()}>
                    <i className="material-icons">add</i>
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