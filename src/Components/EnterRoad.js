import React, { Component } from 'react'


class EnterRoad extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tollbooth: '',
      secretHashed: '',
      deposit: 0,
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
    this.props.enterRoad(this.state.tollbooth, this.state.secretHashed, this.state.deposit)
  }


  render() {

    return (
      <div>
          <h1> Enter Road </h1>
          <form onSubmit={this.handleSubmit}>
                <label>
                  Tollbooth Address:
                  <input type="text" name="tollbooth" value={this.state.tollbooth} onChange={this.handleChange} />
                </label>
                <label>
                  Secret Hashed:
                  <input type="text" name="secretHashed" value={this.state.secretHashed} onChange={this.handleChange} />
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

export default EnterRoad;
