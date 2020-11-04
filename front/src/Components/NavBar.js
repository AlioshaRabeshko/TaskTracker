import { Link } from "react-router-dom";

const NavBar = () => {
  //const isSigned = true;
  return (
    <div className="NavBar">
      {/*<Link className="Link" to={'/'}>Home</Link>*/}
      <Link className="Link" to={'/task-list'}>Task List</Link>
      <Link className="Link" to={'/task-edit'}>Task Edit</Link>      
      <Link className="Link" to={'/user-panel'}>Account</Link>
      <Link className="Link" to={'/sign'}>Sign In</Link>
    </div>
  );
}

export default NavBar;