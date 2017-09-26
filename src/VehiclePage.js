import React, { Component } from 'react'
import { keccak256 } from 'js-sha3';
import { inject, observer } from 'mobx-react'

import TollBoothOperator from '../build/contracts/TollBoothOperator.json'

import SetVehicle from './Components/SetVehicle'
import SetOperator from './Components/SetOperator'
import EnterRoad from './Components/EnterRoad'
import SecretPhrase from './Components/SecretPhrase'


@inject('store') @observer
class VehiclePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          web3: this.props.store.web3,
          vehicle: null,
          balance: null,
          operatorAddress: this.props.store.operatorAddress,
          operator: this.props.store.operator,
          history: [],
        }

        this.setVehicle = this.setVehicle.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.setOperator = this.setOperator.bind(this);
        this.enterRoad = this.enterRoad.bind(this);
        this.getSecretHash = this.getSecretHash.bind(this);
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

    getBalance(account) {
      this.props.store.web3.then(web3 => {
          this.props.store.vehicleBalance = web3.eth.getBalance(account).toNumber()
      })
    }

    setVehicle(vehicle) {
      this.props.store.drivingHistory = [];
      this.props.store.vehicle = vehicle;
      this.getBalance(vehicle);
    }

    getSecretHash(phrase) {
        if (!this.props.store.operator) {
          alert('need to set operator');
          return
        }
        alert(keccak256(phrase));
        console.log(keccak256(phrase));
        // this.props.store.operator.hashSecret(phrase, {from: this.props.store.vehicle}).then(result => {
        //   console.log(result)
        // })
    }

    enterRoad(booth, secretHashed, amount) {
      console.log(booth, secretHashed, amount, this.props.store.vehicle)
      if (!this.props.store.operator) {
        alert('need to set operator');
        return
      }
      this.props.store.operator.enterRoad(booth, secretHashed, {from: this.props.store.vehicle, amount}).then(tx => {
        console.log(tx);
        this.props.store.drivingHistory.push({booth, secretHashed, amount});

      }).catch((err) => {
        console.log(err)
        alert('error in making deposit')
      })
    }

    render() {

      let history;
      if (this.props.store.drivingHistory) {
        history = <div> {this.props.store.drivingHistory.map((x, ix) => <div key={ix}>booth: {x.booth} secretHashed: {x.secretHashed} deposit: {x.amount} </div> )}</div>
      } else {
        history = <div />
      }

      return (
        <div>

          <SetOperator setOperator={this.setOperator} />

          <SetVehicle setVehicle={this.setVehicle} />
          <div> Vehicle: {this.props.store.vehicle} Balance: {this.props.store.vehicleBalance}</div>

          <SecretPhrase getSecret={this.getSecretHash} />

          <EnterRoad enterRoad={this.enterRoad} />

            {history}

        </div>

      )
    }
}


export default VehiclePage;
