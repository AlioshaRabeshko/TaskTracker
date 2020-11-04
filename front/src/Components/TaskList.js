const TaskList = () => {
  const tasks = [
    {
      name:'Do work',
      desc: 'Make .psd maket',
      deadline: new Date(),
      prior: 10,
      time: '4 hours',
      state: 'Pending',
    },
    {
      name:'Do work',
      desc: 'Make .psd maket',
      deadline: new  Date(),
      prior: 10,
      time: '4 hours',
      state: 'In progress',
    },
    {
      name:'Do work',
      desc: 'Make .psd maket',
      deadline: new  Date(),
      prior: 10,
      time: '4 hours',
      state: 'Done',
    },
  ];
  return (
    <div className="Container">
        <ul className="list">
          <li className="list-title">
            <h3>Name</h3>
            <h3>Description</h3>
            <h3>Deadline</h3>
            <h3>Priority</h3>
            <h3>Time</h3>
            <h3>State</h3>
            <h3>Done</h3>
          </li>
          {tasks.map((el, id) => 
            <li key={id}>
              <p>{el.name}</p>
              <p>{el.desc}</p>
              <p>{el.deadline.toDateString()}</p>
              <p>{el.prior}/10</p>
              <p>{el.time}</p>
              <p>{el.state}</p>
              <p><input type="checkbox"/></p>
            </li>)}
        </ul>
    </div>
)};

export default TaskList;
