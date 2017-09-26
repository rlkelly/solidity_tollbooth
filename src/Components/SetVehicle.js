import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

@inject('store') @observer
class SetVehicle extends Component {
  constructor(props) {
    super(props)

    this.state = {
      accounts: this.props.store.accounts,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentWillMount() {
    this.setState({
      vehicle: this.props.store.accounts[0],
      accounts: this.props.store.accounts,
    })
  }

  componentWillReceiveProps() {
    this.setState({
      vehicle: this.props.store.accounts[0],
      accounts: this.props.store.accounts,
    })
  }


  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.setVehicle(this.state.vehicle)
  }

  render() {
    let selector;
    if (this.props.store.accounts) {
      selector = <select name="vehicle" value={this.state.vehicle} onChange={this.handleChange}> {this.props.store.accounts.map((x, i) =>
          <option key={i} value={x}> {x} </option>)}
      </select>
    } else {
      selector = <select />
    }

    return (
      <div>
          <h1> Set Vehicle </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Vehicle Address:
                {selector}
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default SetVehicle;
