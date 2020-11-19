const TaskEdit = () => (
    <div className="Container">
        <select className="SelectAction">
            <option value="0">Choose action:</option>
            <option value="1">Add task</option>
            <option value="2">Edit task</option>
            <option value="3">Delete task</option>
        </select>
        <form className="Form">
            <input type="text" placeholder="Name of the task"/>
            <input type="text" placeholder="Description"/>
            <label className="Label">Deadline: </label>
            <input type="date"/>
            <input type="time"/>
            <input type="number" placeholder="Priority(1 to 10)" max={10}/>
            <input type="text" placeholder="Task complexity"/>
            <input type="text" placeholder="State of the task"/>
            <button type="submit">Add</button>
        </form>  
    </div>
);

export default TaskEdit;
