import { useAuth } from '../context/auth';
import { useHistory } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const SubmitSchema = Yup.object().shape({
	email: Yup.string().required('Required field'),
	pass: Yup.string().required('Required field'),
});

const Sign = () => {
	const history = useHistory();
	const { setToken } = useAuth();

	const signIn = () => {
		setToken({ user: 'name' });
		history.push('/user-panel');
	};

	return (
		<Formik
			validationSchema={SubmitSchema}
			initialValues={{ email: '', pass: '' }}
			onSubmit={signIn}
		>
			{({ values, errors, touched, handleChange }) => (
				<Form className='Form'>
					<h3>Authorization Form</h3>
					<Field
						type='email'
						name='email'
						value={values.email}
						placeholder='Email'
						onChange={handleChange}
					/>
					{errors.email && touched.email ? (
						<div className='error'>{errors.email}</div>
					) : null}
					<Field
						type='password'
						name='pass'
						value={values.pass}
						placeholder='Password'
						onChange={handleChange}
					/>
					{errors.pass && touched.pass ? (
						<div className='error'>{errors.pass}</div>
					) : null}
					<button type='submit'>Sign in</button>
				</Form>
			)}
		</Formik>
	);
};

export default Sign;
