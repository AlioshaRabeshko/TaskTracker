import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth';

const NavBar = () => {
	const { authToken } = useAuth();
	return (
		<nav className='NavBar'>
			<div className='logo'>
				<NavLink className='link' activeClassName='active' to='/' exact>
					AGLTasks
				</NavLink>
			</div>

			<div className='links'>
				{authToken ? (
					<>
						<NavLink className='link' activeClassName='active' to='/task-list'>
							Task List
						</NavLink>
						<NavLink className='link' activeClassName='active' to='/add-task'>
							Add Task
						</NavLink>
						<NavLink className='link' activeClassName='active' to='/user-panel'>
							Account
						</NavLink>
					</>
				) : (
					<NavLink className='link' activeClassName='active' to='/sign' exact>
						Auth
					</NavLink>
				)}
			</div>
		</nav>
	);
};

export default NavBar;
