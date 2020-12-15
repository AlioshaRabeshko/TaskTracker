import {useEffect, useState} from 'react';
import axios from 'axios';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    //  console.log('alah');
    axios.get('/task-list').then((res) => {
      // console.log(res.data);
      setTasks(res.data);
    });
  }, []);
  return (
    <ul className="list">
      <li className="list-title">
        <h3>Name</h3>
        <h3>Description</h3>
        <h3>Deadline</h3>
        <h3>BST</h3>
        <h3>Priority</h3>
        <h3>Time</h3>
        <h3>State</h3>
      </li>
      {tasks.map(
        (
          {
            name,
            description,
            deadline,
            priority,
            initial_time,
            best_start_time,
            state,
          },
          index
        ) => (
          <li key={index}>
            <p>{name}</p>
            <p>
              {description.length > 20
                ? description.substr(0, 20) + '...'
                : description}
            </p>
            <p>{new Date(Date.parse(deadline)).toUTCString()}</p>
            <p>{new Date(Date.parse(best_start_time)).toUTCString()}</p>
            <p>{priority}/10</p>
            <p>{initial_time}</p>
            <p>{state}</p>
          </li>
        )
      )}
    </ul>
  );
};

export default TaskList;
