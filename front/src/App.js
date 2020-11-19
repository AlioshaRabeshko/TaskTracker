import './App.scss';
import { useState } from 'react';
import HomePage from './Components/HomePage';
import Sign from './Components/Sign';
import NavBar from './Components/NavBar';
import UserPanel from './Components/UserPanel';
import TaskList from './Components/TaskList';
import TaskAdd from './Components/TaskAdd';
//import Footer from './Components/Footer';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { AuthContext } from './context/auth';
import PrivateRoute from './Components/PrivateRoute';

const App = () => {
	const existingToken = JSON.parse(localStorage.getItem('token'));
	const [authToken, setAuthTokens] = useState(existingToken);

	const setToken = (data) => {
		localStorage.setItem('token', JSON.stringify(data));
		setAuthTokens(data);
	};
	return (
		<AuthContext.Provider value={{ authToken, setToken }}>
			<BrowserRouter>
				<div className="App">
					<NavBar />
					<div className="Container">
						<Switch className="Content">
							<PrivateRoute path="/user-panel" component={UserPanel} />
							<PrivateRoute path="/task-list" component={TaskList} />
							<PrivateRoute path="/add-task" component={TaskAdd} />
							<Route path="/sign" component={Sign} />
							<Route path="/" component={HomePage} />
						</Switch>
						{/*<Footer />*/}
					</div>
				</div>
			</BrowserRouter>
		</AuthContext.Provider>
	);
};

export default App;
