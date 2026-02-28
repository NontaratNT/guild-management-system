import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User, Lock, Flame, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(username, password)) {
            navigate('/dashboard');
        } else {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            paddingTop: '80px',
            position: 'relative'
        }}>
            <div className="glass-panel animate-fade-up" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '3.5rem 3rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderTop: '2px solid var(--primary)'
            }}>

                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <div className="pulse-gold" style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--background)',
                        border: '2px solid var(--primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <ShieldAlert size={40} className="text-gold" />
                    </div>
                    <h1 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>ประกาศตัวตน</h1>
                    <p style={{ color: 'var(--text-muted)', fontFamily: "'Cinzel', serif" }}>ลั่นดาลประตูสู่สมรภูมิแห่งกิลด์</p>
                </div>

                <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">นามสกุล / ฉายา</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                placeholder="กรอกชื่อนักรบของคุณ"
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                        <label htmlFor="password">รหัสลับ</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
                        <Flame size={20} />
                        จุดไฟแห่งสงคราม (เข้าสู่ระบบ)
                    </button>
                </form>
            </div>
        </div>
    );
}
