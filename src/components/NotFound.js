import './styling/_error.scss';
import { useNavigate } from 'react-router-dom';

function NotFound() {
const navigate = useNavigate();
  return (
    <div className='error'>
      <div className="noise"></div>
      <div className="overlay"></div>
      <div className="terminal">
        <h1>Error <span className="errorcode">404</span></h1>
        <p className="output">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <p className="output">Please return to <button onClick={()=>navigate('/adminLogin')}>admin login</button> or <button onClick={()=>navigate('/voterLogin')}>voter login</button> or <button onClick={()=>navigate('/')}>the homepage</button>.</p>
        <p className="output">Good luck.</p>
      </div>
    </div>
  );
}

export default NotFound;
