import React, { Component } from 'react'


class SetOperator extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
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
    this.props.setOperator(this.state.address)
  }


  render() {

    return (
      <div>
          <h1> Set Operator </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Operator Address:
                <input type="text" name="address" value={this.state.address} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default SetOperator;
