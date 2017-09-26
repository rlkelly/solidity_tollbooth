import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

@inject('store') @observer
class SetTollBooth extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tollbooth: this.props.store.tollbooths[0],
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      tollbooth: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.setTollBooth(this.state.tollbooth)
  }

  render() {
    let selector;
    if (this.props.store.tollbooths) {
      selector = <select name="tollbooth" onChange={this.handleChange}> {this.props.store.tollbooths.map((x, i) =>
          <option key={i} value={x}> {x} </option>)}
      </select>
    } else {
      selector = <select />
    }

    return (
      <div>
          <h1> Set TollBooth </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                TollBooth Address:
                {selector}
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default SetTollBooth;
