import React from 'react'
import ReactDOM from 'react-dom'
import RegulatorPage from './Regulator'
import TollBoothOperatorPage from './TollBoothOperator'
import VehiclePage from './VehiclePage'
import projectStore from './store'
import TollBoothPage from './TollBoothPage'

import {
  HashRouter,
  Switch,
  Route,
  Link
} from 'react-router-dom';

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

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header>
    <nav>
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

const MyApp = () => (
  <div>
    <Header />
    <Main />
  </div>
)

ReactDOM.render(
  <HashRouter>
      <MyApp/>
  </HashRouter>,
  document.getElementById('root')
);
