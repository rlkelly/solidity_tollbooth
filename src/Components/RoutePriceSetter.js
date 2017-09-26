import React, { Component } from 'react'


class RoutePriceSetter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tollbooth1: '',
      tollbooth2: '',
      cost: 0,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.setRoutePrice(this.state.tollbooth1, this.state.tollbooth2, this.state.price)
  }


  render() {

    return (
      <div>
          <h1> Set Route Price </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Entry Address:
                <input type="text" name="tollbooth1" value={this.state.tollbooth1} onChange={this.handleChange} />
              </label>
              <label>
                Exit Address:
                <input type="text" name="tollbooth2" value={this.state.tollbooth2} onChange={this.handleChange} />
              </label>
              <label>
                Cost:
                <input type="text" name="cost" value={this.state.cost} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default RoutePriceSetter;
