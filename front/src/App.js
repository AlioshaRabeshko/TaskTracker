import './App.scss';
import HomePage from './Components/HomePage';
import Sign from './Components/Sign';
import NavBar from './Components/NavBar';
import UserPanel from './Components/UserPanel';
import TaskList from './Components/TaskList';
import TaskAdd from './Components/TaskAdd';
//import Footer from './Components/Footer';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

const App = () => {
  //const isSigned = true;
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <Switch className='Content'>    
          <Route path='/user-panel' component={UserPanel}/>            
          <Route path='/task-list' component={TaskList}/>
          <Route path='/add-task' component={TaskAdd}/>
          <Route path='/sign' component={Sign}/> 
          <Route path='/' component={HomePage}/>
        </Switch>
        {/*<Footer />*/}
      </div>
    </BrowserRouter>
  )
};

export default App;
