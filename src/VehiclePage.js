import React, { Component } from 'react'
import TollBoothOperator from '../build/contracts/TollBoothOperator.json'

import getWeb3 from './utils/getWeb3'
import SetVehicle from './Components/SetVehicle'
import SetOperator from './Components/SetOperator'
import EnterRoad from './Components/EnterRoad'



class VehiclePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          web3: null,
          vehicle: null,
          balance: null,
          operatorAddress: null,
          operator: null,
          history: [],
        }

        this.setVehicle = this.setVehicle.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.setOperator = this.setOperator.bind(this);
        this.enterRoad = this.enterRoad.bind(this);
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

    getBalance(account) {
       this.setState({
         balance: this.state.web3.eth.getBalance(account).toNumber()
       })
    }

    setVehicle(vehicle) {
      this.setState({
        vehicle,
      })
      this.getBalance(vehicle);
    }

    enterRoad(booth, secretHashed, amount) {
      if (!this.state.operator) {
        alert('need to set operator');
      }
      this.state.operator.enterRoad(booth, secretHashed, {from: this.state.vehicle, amount}).then(tx => {
        console.log(tx);
        this.setState(previousState => ({
            history: [...previousState.history, {booth, secretHashed, amount, entry: true}]
        }));

      }).catch((err) => {
        alert('error in making deposit')
      })
    }

    render() {

      let history;
      if (this.state.history) {
        history = <div> {this.state.history.map((x, i) => <div>booth: {x.booth} entry: {x.entry} deposit: {x.deposit} </div> )}</div>
      } else {
        history = <div />
      }

      return (
        <div>
          <SetOperator setOperator={this.setOperator} />
          <div> Operator: {this.state.operator} </div>

          <SetVehicle setVehicle={this.setVehicle} />
          <div> Vehicle: {this.state.vehicle} Balance: {this.state.balance}</div>

          <EnterRoad enterRoad={this.enterRoad} />

            {history}

        </div>

      )
    }
}


export default VehiclePage;
