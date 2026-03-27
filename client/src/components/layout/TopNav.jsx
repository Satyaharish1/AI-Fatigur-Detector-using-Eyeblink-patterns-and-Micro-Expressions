import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getStoredUser } from '../../api/auth';

export default function TopNav() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    clearAuth();
    navigate('/auth');
  };

  return (
    <header className="top-nav">
      <div>
        <p className="brand-title">Cognitive Fatigue Detector</p>
        <span className="brand-subtitle">AI + ML + Web Monitoring Suite</span>
      </div>
      <nav className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/monitor">Monitor</Link>
        {!user ? <Link to="/auth">Login</Link> : <button className="nav-btn" onClick={logout}>Logout</button>}
      </nav>
    </header>
  );
}
