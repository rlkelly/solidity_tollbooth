import React, { Component } from 'react'


class SetMultiplier extends Component {
  constructor(props) {
    super(props)

    this.state = {
      type: 0,
      multiplier: 0,
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
    this.props.setMultiplier(this.state.type, this.state.multiplier)
  }


  render() {

    return (
      <div>
          <h1> Set Multiplier </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Vehicle Type:
                <input type="number" name="type" value={this.state.type} onChange={this.handleChange} />
              </label>
              <label>
                Multiplier:
                <input type="number" name="multiplier" value={this.state.multiplier} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default SetMultiplier;
