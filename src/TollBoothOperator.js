import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

import TollBoothOperator from '../build/contracts/TollBoothOperator.json'
import SetOperator from './Components/SetOperator'
import AddTollBooth from './Components/AddTollBooth'
import RoutePriceSetter from './Components/RoutePriceSetter'
import SetMultiplier from './Components/SetMultiplier'


@inject('store') @observer
class TollBoothOperatorPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      operatorAddress: '',
      operator: this.props.store.operator,
      web3: this.props.store.web3,
      tollbooths: [],
      prices: [],
      multipliers: [],
      regulator: this.props.store.regulator,
    }

    this.setOperator = this.setOperator.bind(this);
    this.addTollBooth = this.addTollBooth.bind(this);
    this.setRoutePrice = this.setRoutePrice.bind(this);
    this.setMultiplier = this.setMultiplier.bind(this);
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

  addTollBooth(address) {
    console.log(address)
    if (!this.props.store.operator) {
      alert('add operator first');
      return
    }
    this.props.store.operator.addTollBooth(address, {from: this.props.store.operatorAddress, gas: 300000}).then(tx => {
      console.log(tx);
      this.props.store.tollbooths = this.props.store.tollbooths.filter(x => x !== address);
      this.props.store.tollbooths.push(address);
    })
  }

  setRoutePrice(tollbooth1, tollbooth2, price) {
    console.log(tollbooth1, tollbooth2, price, this.props.store.operatorAddress)
    if (!this.props.store.operatorAddress) {
      alert('add operator first');
      return
    }
    this.props.store.operator.setRoutePrice(tollbooth1, tollbooth2, price, {from: this.props.store.operatorAddress, gas: 300000}).then(tx => {
      console.log(tx);
      this.setState(previousState => ({
          prices: [...previousState.prices.filter(x => x !== {tollbooth1, tollbooth2, price}), {tollbooth1, tollbooth2, price}]
      }));
    })
  }

  setMultiplier(vehicleType, multiplier) {
    console.log(vehicleType, multiplier, this.props.store.operatorAddress)
    if (!this.props.store.operatorAddress) {
      alert('add operator first');
      return
    }
    this.props.store.operator.setMultiplier(vehicleType, multiplier, {from: this.props.store.operatorAddress, gas: 300000}).then(tx => {
      console.log(tx);
      this.setState(previousState => ({
          multipliers: [...previousState.multipliers.filter(x => x !== {vehicleType, multiplier}), {vehicleType, multiplier}]
      }));
    })
  }

  render() {
    let tollboothsList;
    if (this.props.store.tollbooths) {
        tollboothsList = this.props.store.tollbooths.map((x, i) => <li key={i}> {x} </li>)
    } else {
      tollboothsList = <div />
    }

    let priceList;
    if (this.state.prices) {
        priceList = this.state.prices.map((x, i) => <li key={i}> first: {x.tollbooth1}, second: {x.tollbooth2}, price: {x.priice} </li>)
    } else {
      priceList = <div />
    }
    let multipliers;
    if (this.state.multipliers) {
        multipliers = this.state.multipliers.map((x, i) => <li key={i}> type: {x.vehicleType}, multiplier: {x.multiplier} </li>)
    } else {
      multipliers = <div />
    }

    let existingOperators = this.props.store.operators.map((x, ix) => <div key={ix}> {x.address} </div> )

    return(

      <div>
          <div> existing operators: {existingOperators} </div>

          <SetOperator setOperator={this.setOperator} />
          <div> Operator address: {this.state.operatorAddress} </div>

          <AddTollBooth addTollBooth={this.addTollBooth} />
          <ol> tollbooths:
            {tollboothsList}
          </ol>

          <RoutePriceSetter setRoutePrice={this.setRoutePrice} />
          <ol> pricelist:
            {priceList}
          </ol>

          <SetMultiplier setMultiplier={this.setMultiplier} />
          <ol> multipliers:
            {multipliers}
          </ol>
      </div>
    )
  }
}

export default TollBoothOperatorPage;
