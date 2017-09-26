import React, { Component } from 'react'
import TollBoothOperator from '../build/contracts/TollBoothOperator.json'

import getWeb3 from './utils/getWeb3'
import SetOperator from './Components/SetOperator'
import SetTollBooth from './Components/SetTollBooth'



class TollBoothPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          web3: null,
          operatorAddress: null,
          operator: null,
          history: [],
          tollbooth: null,
        }

        this.setOperator = this.setOperator.bind(this);
        this.setTollBooth = this.setTollBooth.bind(this);
    }

    componentWillMount() {
      // Get network provider and web3 instance.
      // See utils/getWeb3 for more info.

      getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        // Instantiate contract once web3 provided.
        // this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
    }

    setOperator(address) {
      const contract = require('truffle-contract')
      const tollboothOperator = contract(TollBoothOperator)
      tollboothOperator.setProvider(this.state.web3.currentProvider)
      let tollboothOperatorInstance

      let operator = tollboothOperator.at(address);
      this.setState({
        operatorAddress: address,
        operator
      })
    }

    setTollBooth(tollbooth) {
      this.setState({
        tollbooth,
      })
    }

    reportExitRoad(exitSecretClear) {
      if (!this.state.operator) {
        alert('need to set operator');
      }
      this.state.operator.reportExitRoad(exitSecretClear, {from: this.state.tollbooth}).then(tx => {
        const logExited = tx.logs[0];
        if (logExited.event == "LogPendingPayment") {
          this.setState(previousState => ({
              history: [...previousState.history, {exitSecretClear, finalFee: 'pending', refund: 'UNK'}]
          }));
        } else if (logExited.event == "LogRoadExited") {
          let finalFee = logExited.args.finalFee.toNumber()
          let refund = logExited.args.refundWeis.toNumber()
          this.setState(previousState => ({
              history: [...previousState.history, {exitSecretClear, finalFee, refund}]
          }));
        }

      }).catch((err) => {
        alert('error in making deposit')
      })
    }

    render() {
      let history
      if (this.state.history) {
        history = <div> {this.state.history.map((x, i) => <div>exit passphrase: {x.exitSecretClear} final fee: {x.finalFee} refund: {x.refund} </div> )}</div>
      } else {
        history = <div />
      }

      return (
        <div>
          <SetOperator setOperator={this.setOperator} />
          <div> Operator: {this.state.operator} </div>

          <SetTollBooth setTollBooth={this.setTollBooth} />
          <div> tollbooth: {this.state.tollbooth} </div>

          <h1> HISTORY </h1>
          { history }
        </div>
      )
    }
}


export default TollBoothPage;
