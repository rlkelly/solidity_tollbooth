import React, { Component } from 'react'


class SecretPhrase extends Component {
  constructor(props) {
    super(props)

    this.state = {
      secret: '',
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
    this.props.getSecret(this.state.secret)
  }


  render() {

    return (
      <div>
          <h1> Secret Phrase </h1>
          <form onSubmit={this.handleSubmit}>
              <label>
                Secret Phrase:
                <input type="text" name="secret" value={this.state.secret} onChange={this.handleChange} />
              </label>
            <input type="submit" value="Submit" />
          </form>
      </div>
    )
  }
}

export default SecretPhrase;
