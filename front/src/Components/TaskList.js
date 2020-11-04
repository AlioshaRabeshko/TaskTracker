const TaskList = () =>
  <div className="Container">
      <p>
        This is how much you've already done.<br></br>
        Not really much, though. In fact, you fucking did nothing, go work, prick
      </p>
      <table className="Tasklist">
        <thead>
        <tr>
          <th>Task name</th>
          <th>Description</th>
          <th>Deadline</th>
          <th>Priority</th>
          <th>Time</th>
          <th>State</th>
          <th>Mark as done</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>Do anal</td>
          <td>Must cum</td>
          <td>15.15.2015 15:15</td>
          <td>10/10</td>
          <td>Infinity</td>
          <td>In progress</td>
          <td>
            <input type="checkbox"></input>
          </td>
        </tr>
        <tr>
          <td>Do anal</td>
          <td>Must cum</td>
          <td>15.15.2015 15:15</td>
          <td>10/10</td>
          <td>Infinity</td>
          <td>In progress</td>
          <td><input type="checkbox"></input></td>
        </tr>
        <tr>
          <td>Do anal</td>
          <td>Must cum</td>
          <td>15.15.2015 15:15</td>
          <td>10/10</td>
          <td>Infinity</td>
          <td>In progress</td>
          <td><input type="checkbox"></input></td>
        </tr>
        </tbody>
      </table>
  </div>;

export default TaskList;
