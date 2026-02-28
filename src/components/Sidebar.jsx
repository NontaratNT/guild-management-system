import { Shield, Swords, Database, Users, LayoutDashboard, LogOut, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="sidebar glass-panel" style={{
            width: '280px',
            height: 'calc(100vh - 100px)',
            position: 'fixed',
            left: '20px',
            top: '80px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 50
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h3 className="text-gold" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{user.guild}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.username} | {user.role}</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="ภาพรวมกิลด์" />
                <SidebarLink to="/members" icon={<Users size={20} />} label="รายนามนักรบ" />
                <SidebarLink to="/rebirth-boss" icon={<Flame size={20} />} label="บันทึกบอสจุติ" />
                <SidebarLink to="/castle-boss" icon={<Swords size={20} />} label="บันทึกบอสปราสาท" />
                <SidebarLink to="/war-plans" icon={<Shield size={20} />} label="วอร์กิล" />
            </nav>

            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
                <LogOut size={18} />
                ถอยทัพ (Logout)
            </button>
        </div>
    );
}

function SidebarLink({ to, icon, label }) {
    return (
        <Link to={to} className="nav-link" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1.2rem',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.03)'
        }}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}
