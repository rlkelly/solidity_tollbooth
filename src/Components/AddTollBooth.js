import React, { Component } from 'react'


class AddTollBooth extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tollbooth: '',
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
    this.props.addTollBooth(this.state.tollbooth)
  }


  render() {

    return (
      <div>
          <h1> Add Tollbooth </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Tollbooth Address:
                <input type="text" name="tollbooth" value={this.state.tollbooth} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default AddTollBooth;
