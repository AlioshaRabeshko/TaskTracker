const TaskList = () => {
  const tasks = [
    {
      name:'Do anal',
      desc: 'Must cum',
      deadline: new Date(),
      prior: 10,
      time: 'Infinity',
      state: 'In progress',
    },
    {
      name:'Do anal',
      desc: 'Must cum',
      deadline: new  Date(),
      prior: 10,
      time: 'Infinidsafdty',
      state: 'In progress',
    },
    {
      name:'Do anal',
      desc: 'Must cum',
      deadline: new  Date(),
      prior: 10,
      time: 'Infinity',
      state: 'In progress',
    },
  ];
  return (
    <div className="Container">
        <p>
          This is how much you've already done.<br></br>
          Not really much, though. In fact, you fucking did nothing, go work, prick
        </p>
        <ul className="list">
          <li className="list-title">
            <h3>Name</h3>
            <h3>Description</h3>
            <h3>Deadline</h3>
            <h3>Priority</h3>
            <h3>Time</h3>
            <h3 className="last">State</h3>
          </li>
          {tasks.map((el, id) => 
            <li key={id}>
              <p>{el.name}</p>
              <p>{el.desc}</p>
              <p>{el.deadline.toDateString()}</p>
              <p>{el.prior}/10</p>
              <p>{el.time}</p>
              <p>{el.state}</p>
            </li>)}
        </ul>
    </div>
)};

export default TaskList;
