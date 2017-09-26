import React, { Component } from 'react'
import Regulator from '../build/contracts/Regulator.json'
import TollBoothOperator from '../build/contracts/TollBoothOperator.json'

import OperatorCreator from './Components/OperatorCreator'
import VehicleType from './Components/VehicleType'
import { inject, observer } from 'mobx-react'

// import './css/oswald.css'
// import './css/open-sans.css'
// import './css/pure-min.css'
// import './App.css'

let mainAccount;

@inject('store') @observer
class RegulatorPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      regulatorAddress: this.props.store.regulatorAddress,
      regulator: this.props.store.regulator,
      vehicles: [],
      operators: [],
    }

    this.createAccount = this.createAccount.bind(this);
    this.setVehicleType = this.setVehicleType.bind(this);
  }
  componentWillMount() {
    if (!this.props.store.regulator) {
      this.instantiateContract();
    }
  }

  createAccount(address, deposit) {
    return this.props.store.regulator.createNewOperator(address, deposit, {from: mainAccount, gas: 3000000}).then(tx => {
      console.log(tx)
      this.props.store.operators.push({address, deposit})
      this.props.store.currentOperator = {address, deposit}

      const contract = require('truffle-contract')
      const tollboothOperator = contract(TollBoothOperator)
      this.props.store.web3.then(web3 => {
        tollboothOperator.setProvider(web3.currentProvider)
        let operator = tollboothOperator.at(address);
        this.props.store.operator = operator;
        this.props.store.operatorAddress = address;
      })

    })
  }

  setVehicleType(vehicle, type) {
    this.props.store.regulator.setVehicleType(vehicle, type, {from: mainAccount, gas: 3000000}).then(tx => {
      let vehicleData = {vehicle: tx.logs[0].args.vehicle, type}
      this.setState(previousState => ({
          vehicles: [...previousState.vehicles.filter(x => x.vehicle !== vehicleData.vehicle), vehicleData]
      }));
    }).catch(exception => {
      alert(exception);
    })
  }

  instantiateContract() {
    this.props.store.web3.then((web3) => {
      const contract = require('truffle-contract')
      const regulator = contract(Regulator)
      regulator.setProvider(web3.currentProvider)
      var regulatorInstance

      // Get accounts.
      web3.eth.getAccounts((error, accounts) => {
        mainAccount = accounts[0];
        this.props.store.accounts = accounts.slice(1, 10);
        regulator.new({from: accounts[0], gas: this.props.store.defaultGas}).then((instance) => {
          regulatorInstance = instance
          this.props.store.regulator = regulatorInstance;
          this.setState({defaultAccount: mainAccount})
          this.setState({otherAccounts: accounts.slice(1, 11)})

          return regulatorInstance.getOwner.call()
        }).then((result) => {
          // Update state with the result.
          this.props.store.regulatorAddress = result
          return this.setState({ regulatorAddress: result,
                                 regulatorInstance })
        })
      })
    })
  }

  render() {
    let operators;
    if (this.props.store.operators) {
      operators = <div> {this.props.store.operators.map((x, i) =>
          <div key={i} value={x}> address: {x.address}, deposit: {x.deposit} </div>)}
      </div>
    } else {
      operators = <div />
    }

    let cars;
    if (this.state.vehicles) {
      cars = <div> {this.state.vehicles.map((x, i) =>
          <div key={i} value={x}> vehicle: {x.vehicle}, type: {x.type} </div>)}
      </div>
    } else {
      cars = <div />
    }

    return (
      <div className="App">

        <main className="container">
          <div className="pure-g">

            <OperatorCreator web3={this.state.web3}
                         account={mainAccount}
                         otherAccounts={this.state.otherAccounts}
                         createAccount={this.createAccount}/>
            <div>
              <h1> Operators: </h1>
              {operators}
            </div>

            <VehicleType addVehicle={this.setVehicleType} />
            <div>
              <h1> Vehicles </h1>
              {cars }
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default RegulatorPage
