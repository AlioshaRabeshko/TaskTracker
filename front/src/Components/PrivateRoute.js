import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/auth';

const PrivateRoute = ({ component: Component, ...rest }) => {
	const { authToken } = useAuth();
	return (
		<Route
			{...rest}
			render={(props) =>
				authToken ? <Component {...props} /> : <Redirect to='/sign' />
			}
		/>
	);
};

export default PrivateRoute;
