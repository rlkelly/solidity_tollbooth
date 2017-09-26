import React, { Component } from 'react'
import Regulator from '../build/contracts/Regulator.json'
import getWeb3 from './utils/getWeb3'

import OperatorCreator from './Components/OperatorCreator'
import VehicleType from './Components/VehicleType'

// import './css/oswald.css'
// import './css/open-sans.css'
// import './css/pure-min.css'
// import './App.css'

let mainAccount;

class RegulatorPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      vehicles: [],
      operators: [],
    }

    this.setOperator = this.setOperator.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.setVehicleType = this.setVehicleType.bind(this);
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

  setOperator(operator) {
    this.setState({
      operator,
    })
  }

  createAccount(address, deposit) {
    return this.state.regulatorInstance.createNewOperator(address, deposit, {from: mainAccount, gas: 3000000}).then(tx => {
      console.log(tx)
      this.setState(previousState => ({
          operators: [...previousState.operators, {address, deposit}]
      }));
    })
  }

  setVehicleType(vehicle, type) {
    this.state.regulatorInstance.setVehicleType(vehicle, type, {from: mainAccount, gas: 3000000}).then(tx => {
      console.log(tx);
      this.setState(previousState => ({
          vehicles: [...previousState.vehicles.filter(x => x.vehicle !== vehicle), {vehicle, type}]
      }));
    })
  }

  instantiateContract() {

    const contract = require('truffle-contract')
    const regulator = contract(Regulator)
    regulator.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var regulatorInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      mainAccount = accounts[0];
      regulator.new({from: accounts[0], gas: 3000000}).then((instance) => {
        regulatorInstance = instance
        console.log(accounts[1]);
        this.setState({regulatorInstance})
        this.setState({defaultAccount: mainAccount})
        this.setState({otherAccounts: accounts.slice(1, 11)})

        console.log(accounts[1])

        return regulatorInstance.getOwner.call()
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result,
                               regulatorInstance })
      })
    })
  }

  render() {
    let operators;
    if (this.state.operators) {
      operators = <div> {this.state.operators.map((x, i) =>
          <div key={i} value={x}> address: {x.address}, deposit: {x.deposit} </div>)}
      </div>
    } else {
      cars = <div />
    }

    let cars;
    if (this.state.vehicles) {
      cars = <div> {this.state.vehicles.map((x, i) =>
          <div key={i} value={x}> vehicle: {x.vehicle}, type: {x.type} </div>)}
      </div>
    } else {
      operators = <div />
    }

    console.log(this.props);

    return (
      <div className="App">

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p>The stored value of owner is: {this.state.storageValue}</p>
            </div>

            <OperatorCreator regulator={this.state.regulatorInstance}
                         setOperator={this.setOperator}
                         web3={this.state.web3}
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
