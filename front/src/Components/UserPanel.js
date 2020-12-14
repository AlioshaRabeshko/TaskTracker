import { useAuth } from '../context/auth';
import { useHistory } from 'react-router-dom';

const UserPanel = () => {
	const history = useHistory();
	const { setToken } = useAuth();
	const logOut = () => {
		setToken(null);
		history.push('/');
	};
	return (
		<>
			Account details
			<div className='user-details'>
				<div>
					<img
						alt=''
						src='data:image/png;base64,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'
					/>
				</div>
				<div>
					<h2>User Name</h2>
					<h3>Email@mail.mail</h3>
				</div>
			</div>
			<ul className='settings-list'>
				<li>tasks history</li>
				<li>current tasks</li>
				<li>settings</li>
				<li onClick={logOut}>Log Out</li>
			</ul>
		</>
	);
};

export default UserPanel;
