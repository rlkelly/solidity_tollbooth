import React, { Component } from 'react'


class VehicleType extends Component {
  constructor(props) {
    super(props)

    this.state = {
      vehicle: '',
      type: '',
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
    this.props.addVehicle(this.state.vehicle, this.state.type);
  }


  render() {

    return (
      <div>
          <h1> Set Vehicle Type </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Vehicle:
                <input type="text" name="vehicle" value={this.state.vehicle} onChange={this.handleChange} />
              </label>
              <label>
                Type:
                <input type="number" name="type" value={this.state.type} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default VehicleType;
