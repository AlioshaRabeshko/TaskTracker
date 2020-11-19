import { useAuth } from '../context/auth';
import { useHistory } from 'react-router-dom';

const Sign = () => {
	const history = useHistory();
	const { setToken } = useAuth();
	const signIn = () => {
		setToken({ user: 'name' });
		history.push('/user-panel');
	};
	return (
		<form className="Form">
			<h3>Authorization form</h3>
			<input type="email" placeholder="Email" />
			<input type="password" placeholder="Password" />
			<button type="submit" onClick={signIn}>
				Sign in
			</button>
		</form>
	);
};

export default Sign;
