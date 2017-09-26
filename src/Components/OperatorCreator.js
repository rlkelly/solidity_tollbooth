import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

@inject('store') @observer
class OperatorCreator extends Component {
  constructor(props) {
    super(props)

    this.state = {
      deposit: 0,
      owner: 0x0,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({
      owner: this.props.store.accounts[0],
    })
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  componentWillMount() {
    this.setState({
      owner: this.props.store.accounts[0],
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.createAccount(this.state.owner, this.state.deposit)
  }


  render() {
    let selector;
    if (this.props.store.accounts) {
      selector = <select name="owner" value={this.state.owner} onChange={this.handleChange}> {this.props.store.accounts.map((x, i) =>
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
