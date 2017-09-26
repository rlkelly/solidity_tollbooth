import React, { Component } from 'react'


class OperatorCreator extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      deposit: '',
      owner: '',
      regulator: this.props.regulator,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createNewOperator = this.createNewOperator.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({
      otherAccounts: this.props.otherAccounts
    })
  }

  createNewOperator() {
    let operator;
    const regulatorInstance = this.props.regulator;
    this.props.createAccount(this.state.owner, this.state.deposit)
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.createNewOperator();
  }


  render() {
    let selector;
    if (this.state.otherAccounts) {
      selector = <select name="owner" value={this.state.owner} onChange={this.handleChange}> {this.state.otherAccounts.map((x, i) =>
          <option key={i} value={x}> {x} </option>)}
      </select>
    } else {
      selector = <select />
    }

    return (
      <div>
          <h1> Create Operator </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Owner:
                {selector}
              </label>
              <label>
                Deposit:
                <input type="number" name="deposit" value={this.state.deposit} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default OperatorCreator;
