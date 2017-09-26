import React, { Component } from 'react'
import Regulator from '../build/contracts/Regulator.json'
import TollBoothOperator from '../build/contracts/TollBoothOperator.json'
import getWeb3 from './utils/getWeb3'
import SetOperator from './Components/SetOperator'
import AddTollBooth from './Components/AddTollBooth'
import RoutePriceSetter from './Components/RoutePriceSetter'
import SetMultiplier from './Components/SetMultiplier'


class TollBoothOperatorPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      operatorAddress: '',
      operator: null,
      web3: null,
      tollbooths: [],
      prices: [],
      multipliers: [],
    }

    this.setOperator = this.setOperator.bind(this);
    this.addTollBooth = this.addTollBooth.bind(this);
    this.setRoutePrice = this.setRoutePrice.bind(this);
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
      this.instantiateContract()
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

  addTollBooth(address) {
    if (!this.state.operator) {
      alert('add operator first');
    }
    this.state.operator.addTollBooth(address, {from: this.state.operatorAddress, gas: 300000}).then(tx => {
      console.log(tx);
      this.setState(previousState => ({
          tollbooths: [...previousState.tollbooths.filter(x => x !== address), address]
      }));
    })
  }

  setRoutePrice(tollbooth1, tollbooth2, price) {
    if (!this.state.operator) {
      alert('add operator first');
    }
    this.state.operator.setRoutePrice(tollbooth1, tollbooth2, price, {from: this.state.operatorAddress, gas: 300000}).then(tx => {
      console.log(tx);
      this.setState(previousState => ({
          prices: [...previousState.prices.filter(x => x !== {tollbooth1, tollbooth2, price}), {tollbooth1, tollbooth2, price}]
      }));
    })
  }

  setMultiplier(vehicleType, multiplier) {
    if (!this.state.operator) {
      alert('add operator first');
    }
    this.state.operator.setRoutePrice(vehicleType, multiplier, {from: this.state.operatorAddress, gas: 300000}).then(tx => {
      console.log(tx);
      this.setState(previousState => ({
          multipliers: [...previousState.multipliers.filter(x => x !== {vehicleType, multiplier}), {vehicleType, multiplier}]
      }));
    })
  }

  render() {
    let tollboothsList;
    if (this.state.tollbooths) {
        tollboothsList = this.state.tollbooths.map((x, i) => <li key={i}> {x} </li>)
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

    return(

      <div>
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
