import TaskEdit from './TaskEdit';
import TasksHistory from './TasksHistory';
import TasksList from './TasksList';
import UserPanel from './UserPanel';

const Container = () => (
    <div className="container">
      <TaskEdit />
      <UserPanel />
      <TasksList />
      <TasksHistory />
    </div>
  );

export default Container;
