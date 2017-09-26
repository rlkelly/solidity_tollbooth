import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  HashRouter,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import RegulatorPage from './Regulator'
import TollBoothOperatorPage from './TollBoothOperator'
import VehiclePage from './VehiclePage'
import TollBoothPage from './TollBoothPage'
import { Provider, observer, inject } from 'mobx-react'
import projectStore from './store'


const Home = () => (
  <div>
    <h1>Welcome!</h1>
  </div>
)

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route exact path='/app' component={RegulatorPage} />
      <Route exact path='/tb' component={TollBoothOperatorPage } />
      <Route exact path='/vehicle' component={VehiclePage} />
      <Route exact path='/tollbooth' component={TollBoothPage} />
    </Switch>
  </main>
)


@inject('store') @observer
class Header extends Component {
  render() {
    let currentOperator;
    if (this.props.store.currentOperator.address) {
      currentOperator = <div> CURRENT OPERATOR: {this.props.store.operatorAddress} </div>
    } else { currentOperator = <div /> }

    return (
      <header>
        <nav>
          <div> CURRENT REGULATOR: {this.props.store.regulatorAddress} </div>
          {currentOperator}
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/app'>Regulator</Link></li>
            <li><Link to='/tb'>TollBooth Operator</Link></li>
            <li><Link to='/vehicle'>Vehicle</Link></li>
            <li><Link to='/tollbooth'>TollBooth</Link></li>
          </ul>
        </nav>
      </header>
    )
  }
}

const MyApp = () => (
  <div>
    <Header />
    <Main />
  </div>
)

ReactDOM.render(
  <Provider store={projectStore}>
    <HashRouter>
      <MyApp/>
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);
