import React, { Component } from 'react';
import Row from './Row';
import './Table.css';

export default class Table extends Component {
    constructor(props) {
      super(props);
      this.state = {
        selected: null
      };
    }
  
    handleRowClick(index) {
        if (this.state.selected !== index) {
            this.setState({selected: index});
        }
    }

    handleDelete(index) {
        this.setState({selected: null});
        this.props.onDelete();
    }

    handleValidate(index, row) {
        this.props.onValidate(index, row);
    }

    handleNewRow() {
        const accounts = this.accounts.slice();
        accounts.push({});
        this.setState({accounts});
    }

    render() {
        const table = this.props.accounts.map((account, index) => {
            return  <Row key={account.name} account={account} index={index} selected={index === this.state.selected}
                        onClick={() => this.handleRowClick(index)}
                        onDelete={() => this.handleDelete(index)}
                        onValidate={(row) => this.handleValidate(index, row)}>
                    </Row> 
        });

        return (
            <div className="table flex wrap">
                { table }
                <div className={'relative flex-center add row row'+(this.props.accounts.length%2)} 
                    onClick={() => this.handleNewRow()}>
                    <i className="material-icons">add</i>
                </div>               
            </div>
        );
    }
}