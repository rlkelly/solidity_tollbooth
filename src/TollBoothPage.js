import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import TollBoothOperator from '../build/contracts/TollBoothOperator.json'
import SetOperator from './Components/SetOperator'
import SetTollBooth from './Components/SetTollBooth'
import ExitRoad from './Components/ExitRoad'


@inject('store') @observer
class TollBoothPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          web3: this.props.store.web3,
          operatorAddress: null,
          operator: null,
          history: [],
          tollbooth: null,
        }

        this.setOperator = this.setOperator.bind(this);
        this.setTollBooth = this.setTollBooth.bind(this);
        this.reportExitRoad = this.reportExitRoad.bind(this);
    }

    setOperator(address) {
      const contract = require('truffle-contract')
      const tollboothOperator = contract(TollBoothOperator)
      this.props.store.web3.then(web3 => {
        tollboothOperator.setProvider(web3.currentProvider)
        let operator = tollboothOperator.at(address);
        this.props.store.operator = operator;
        this.props.store.operatorAddress = address;
      })
    }

    setTollBooth(tollbooth) {
      this.props.store.currentTollbooth = tollbooth;
    }

    reportExitRoad(exitSecretClear) {
      if (!this.state.operator) {
        alert('need to set operator');
      }
      this.state.operator.reportExitRoad(exitSecretClear, {from: this.props.store.currentTollbooth}).then(tx => {
        const logExited = tx.logs[0];
        if (logExited.event === "LogPendingPayment") {
          this.setState(previousState => ({
              history: [...previousState.history, {exitSecretClear, finalFee: 'pending', refund: 'UNK'}]
          }));
        } else if (logExited.event === "LogRoadExited") {
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

          <div> regulator: {this.props.store.regulatorAddress} </div>

          <SetOperator setOperator={this.setOperator} />
          <div> Operator: {this.state.operator} </div>

          <SetTollBooth setTollBooth={this.setTollBooth} />
          <div> tollbooth: {this.props.store.currentTollbooth} </div>

          <ExitRoad exitRoad={this.reportExitRoad} />

          <h1> HISTORY </h1>
          { history }
        </div>
      )
    }
}


export default TollBoothPage;
