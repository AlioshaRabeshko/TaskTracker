import { NavLink } from 'react-router-dom';
import { Fragment } from 'react';
import { useAuth } from '../context/auth';

const NavBar = () => {
	const { authToken } = useAuth();
	return (
		<div className="NavBar">
			<NavLink className="logo link" activeClassName="active" to="/" exact>
				AGLTasks
			</NavLink>
			<div className="links">
				{authToken ? (
					<Fragment>
						<NavLink className="link" activeClassName="active" to="/task-list">
							Task List
						</NavLink>
						<NavLink className="link" activeClassName="active" to="/add-task">
							Add Task
						</NavLink>
						<NavLink className="link" activeClassName="active" to="/user-panel">
							Account
						</NavLink>
					</Fragment>
				) : (
					<NavLink className="link" activeClassName="active" to="/sign" exact>
						Auth
					</NavLink>
				)}
			</div>
		</div>
	);
};

export default NavBar;
