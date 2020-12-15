import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const SubmitSchema = Yup.object().shape({
	name: Yup.string().required('Required field'),
	desc: Yup.string().required('Required field'),
	date: Yup.date().required('Required field'),
	ttd: Yup.number().required('Required field').min(0),
	priority: Yup.number().required('Required field').min(1).max(10),
	difficulty: Yup.number().required('Required field').min(1).max(10),
});

const TaskEdit = () => {
	const addTask = (values) => {
		console.log(values);
		axios
			.post('/add-task', values)
			.then((res) => {
				res.status === 200 ? console.log('success') : console.log('failure');
			})
			.catch((err) => console.log(err));
	};

	return (
		<Formik
			validationSchema={SubmitSchema}
			initialValues={{
				name: '',
				desc: '',
				date: '',
				ttd: '',
				priority: '',
				difficulty: '',
			}}
			onSubmit={addTask}
		>
			{({ values, errors, touched, handleChange, handleSubmit }) => (
				<Form className='Form' onSubmit={handleSubmit}>
					<h3>Create a task:</h3>
					<Field
						type='text'
						placeholder='Name of the task'
						name='name'
						value={values.name}
						onChange={handleChange}
					/>
					{errors.name && touched.name ? (
						<div className='error'>{errors.name}</div>
					) : null}
					<Field
						type='text'
						placeholder='Description'
						name='desc'
						value={values.desc}
						onChange={handleChange}
					/>
					{errors.desc && touched.desc ? (
						<div className='error'>{errors.desc}</div>
					) : null}
					<label className='Label'>Deadline: </label>
					<Field
						type='datetime-local'
						name='date'
						value={values.date}
						onChange={handleChange}
					/>
					{errors.date && touched.date ? (
						<div className='error'>{errors.date}</div>
					) : null}
					<Field
						type='number'
						placeholder='Time to do(in hours)'
						name='ttd'
						value={values.ttd}
						onChange={handleChange}
					/>
					{errors.ttd && touched.ttd ? (
						<div className='error'>{errors.ttd}</div>
					) : null}
					<Field
						type='number'
						placeholder='Priority(1 to 10)'
						name='priority'
						value={values.priority}
						onChange={handleChange}
					/>
					{errors.priority && touched.priority ? (
						<div className='error'>{errors.priority}</div>
					) : null}
					<Field
						type='number'
						placeholder='Task difficulty(1 to 10)'
						name='difficulty'
						value={values.difficulty}
						onChange={handleChange}
					/>
					{errors.difficulty && touched.difficulty ? (
						<div className='error'>{errors.difficulty}</div>
					) : null}
					<button type='submit'>Create</button>
					<pre>{JSON.stringify(values, null, 2)}</pre>
				</Form>
			)}
		</Formik>
	);
};

export default TaskEdit;
