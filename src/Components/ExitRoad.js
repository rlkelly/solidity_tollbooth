import React, { Component } from 'react'


class ExitRoad extends Component {
  constructor(props) {
    super(props)

    this.state = {
      exitSecret: '',
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
    this.props.exitRoad(this.state.exitSecret)
  }


  render() {

    return (
      <div>
          <h1> Exit Road </h1>
          <form onSubmit={this.handleSubmit}>
                <label>
                  Exit Secret Cleared:
                  <input type="text" name="exitSecret" value={this.state.exitSecret} onChange={this.handleChange} />
                </label>
              <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default ExitRoad;
