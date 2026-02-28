import { Link, useLocation } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <Shield className="text-secondary" />
                <span>Guild<span className="text-gradient">Master</span></span>
            </Link>

            <div className="nav-links">
                <Link to="/" className={`nav-link ${!isLoginPage ? 'text-main' : ''}`}>
                    หน้าแรก
                </Link>
                <Link to="/login" className="btn btn-secondary">
                    <LogIn size={18} />
                    เข้าสู่ระบบ
                </Link>
            </div>
        </nav>
    );
}
