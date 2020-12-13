const TaskList = () => {
	const tasks = [
		{
			name: 'Do work',
			desc: 'Make .psd maket',
			deadline: new Date(),
			prior: 10,
			time: '4 hours',
			state: 'Pending',
		},
		{
			name: 'Do work',
			desc: 'Finish frontend',
			deadline: new Date(),
			prior: 10,
			time: '4 hours',
			state: 'In progress',
		},
		{
			name: 'Do work',
			desc: 'Make .psd maketdawdwadsadawdasdawdasdawdwasdwqad',
			deadline: new Date(),
			prior: 10,
			time: '4 hours',
			state: 'Done',
		},
	];
	return (
		<ul className='list'>
			<li className='list-title'>
				<h3>Name</h3>
				<h3>Description</h3>
				<h3>Deadline</h3>
				<h3>Priority</h3>
				<h3>Time</h3>
				<h3>State</h3>
				<h3>Done</h3>
			</li>
			{tasks.map(({ name, desc, deadline, prior, time, state }, index) => (
				<li key={index}>
					<p>{name}</p>
					<p>{desc.length > 20 ? desc.substr(0, 20) + '...' : desc}</p>
					<p>{deadline.toLocaleString()}</p>
					<p>{prior}/10</p>
					<p>{time}</p>
					<p>{state}</p>
					<p>
						<input type='checkbox' />
					</p>
				</li>
			))}
		</ul>
	);
};

export default TaskList;
