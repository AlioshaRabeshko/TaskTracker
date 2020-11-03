import './App.scss';
import Container from './Components/Container';
import Sign from './Components/Sign';
import NavBar from './Components/NavBar';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

const App = () => (
    <BrowserRouter>
      <div className="App">
        <NavBar/>
        <Switch>
          <Route path='/sign' component={Sign}/>
          <Route path='/' component={Container}/>
        </Switch>
      </div>
    </BrowserRouter>
  );

export default App;
