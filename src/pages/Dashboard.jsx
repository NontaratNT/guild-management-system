import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../context/MemberContext';
import { useActivities } from '../context/ActivityContext';
import { Users, Swords, Database, TrendingUp, Shield, Skull, AlertTriangle, Trophy, Zap, Clock, ChevronRight, Activity, MapPin, X } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const { members } = useMembers();
    const { computedMemberStats, recentLogs } = useActivities();
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);

    const stats = useMemo(() => {
        const aliveMembers = members.filter(m => m.status === 'มีชีวิต');
        const warnedCount = aliveMembers.filter(m => {
            const s = computedMemberStats[m.name];
            return s && (s.castleMiss > 0 || s.warMiss > 0 || s.rebirthMiss > 0);
        }).length;

        return {
            total: members.length,
            alive: aliveMembers.length,
            warned: warnedCount,
            powerTotal: '12.5M',
            winRate: '84%',
            gold: '1.2M'
        };
    }, [members, computedMemberStats]);

    return (
        <div style={{ marginLeft: '320px', padding: '100px 40px 40px' }}>
            {/* Hero Banner Section */}
            <div className="glass-panel" style={{
                padding: '3rem',
                marginBottom: '2.5rem',
                background: 'linear-gradient(135deg, rgba(140, 42, 42, 0.1) 0%, rgba(194,147,61,0.05) 100%)',
                borderLeft: '4px solid var(--primary)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                        <MapPin size={18} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>ฐานทัพหลัก: แดนหิมะในตำนาน</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>ยินดีต้อนรับ, {user?.username}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
                        ฐานที่มั่นของกิลด์ <span className="text-gold" style={{ fontWeight: 'bold' }}>Yukisama</span> ปัจจุบันอยู่ที่ <span className="text-gold">เลเวล 15</span>
                        กองทัพของเราพร้อมสำหรับการทำสงครามและการชิงชัยในทุกสมรภูมิ
                    </p>
                </div>
                {/* Decorative Icon */}
                <Shield size={200} style={{
                    position: 'absolute',
                    right: '-40px',
                    bottom: '-40px',
                    opacity: 0.05,
                    color: 'var(--primary)',
                    transform: 'rotate(-15deg)'
                }} />
            </div>

            {/* Vital Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <VitalCard icon={<Users size={24} />} label="นักรบที่มีชีวิต" value={stats.alive} color="#4ade80" />
                <VitalCard icon={<AlertTriangle size={24} />} label="โดนคาดโทษ" value={stats.warned} color="#facc15" />
                <VitalCard icon={<Trophy size={24} />} label="อัตราชนะกิลด์วอร์" value={stats.winRate} color="var(--primary)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column: Activity & Missions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 className="text-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Swords size={20} /> ภารกิจและสงคราม
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>อัปเดตล่าสุด: 5 นาทีที่แล้ว</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <MissionItem
                                title="ศึกชิงปราสาท Shadow Legion"
                                time="เริ่มในอีก 02:45:12"
                                status="สมาชิกต้องออนไลน์ 80%+"
                                type="war"
                            />
                            <MissionItem
                                title="บอสจุติ: ไคล์ (Kyle)"
                                time="สิ้นสุดรีเซ็ต วันพรุ่งนี้"
                                status="จารึกคะแนนไปแล้ว 12/48 คน"
                                type="boss"
                            />
                            <MissionItem
                                title="กิลด์วอร์ (โหมดปกติ)"
                                time="จบใน 6 ชม."
                                status="คะแนนนำอยู่ 2,450 : 1,900"
                                type="global"
                            />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="text-gold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <Activity size={20} /> ความเคลื่อนไหวล่าสุด
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentLogs.length > 0 ? (
                                recentLogs.map((log, i) => (
                                    <LogEntry
                                        key={i}
                                        name={log.user}
                                        action={log.action}
                                        detail={log.detail}
                                        time={log.timestamp}
                                    />
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>ยังไม่มีความเคลื่อนไหว</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Honors and Warnings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 className="text-gold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <Zap size={20} /> ทำเนียบเกียรติยศ
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <TopWarrior rank={1} name="Yukisama" score="4.2M" />
                            <TopWarrior rank={2} name="Valkyrie" score="3.8M" />
                            <TopWarrior rank={3} name="Arthur" score="3.5M" />
                            <TopWarrior rank={4} name="Sigurd" score="3.1M" />
                            <TopWarrior rank={5} name="Skadi" score="2.9M" />
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.8rem', padding: '0.6rem' }}
                            onClick={() => setIsRankModalOpen(true)}
                        >
                            ดูอันดับทั้งหมด <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1rem' }}>
                            <AlertTriangle size={18} /> ศาลาคาดโทษ (Urgent)
                        </h3>
                        {members.filter(m => m.castleMiss >= 3 || m.warMiss >= 3 || m.rebirthMiss >= 3).map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', padding: '0.8rem', background: 'rgba(239,68,68,0.05)', borderRadius: '4px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ขาดงานสะสมเกินพิกัด</div>
                                </div>
                                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>!!!</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Rankings Modal */}
            {isRankModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '2rem'
                }}>
                    <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2 className="text-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Trophy size={24} /> ทำเนียบนักรบผู้ทรงเกียรติ
                            </h2>
                            <button className="btn-icon" onClick={() => setIsRankModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'Yukisama', score: '4.2M' },
                                { name: 'Valkyrie', score: '3.8M' },
                                { name: 'Arthur', score: '3.5M' },
                                { name: 'Sigurd', score: '3.1M' },
                                { name: 'Skadi', score: '2.9M' },
                                { name: 'Heimdall', score: '2.7M' },
                                { name: 'Freya', score: '2.5M' },
                                { name: 'Tyr', score: '2.3M' },
                                { name: 'Fenrir', score: '2.1M' },
                                { name: 'Loki', score: '1.9M' }
                            ].map((w, i) => (
                                <TopWarrior key={i} rank={i + 1} name={w.name} score={w.score} />
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            อันดับคำนวณจากคะแนนสะสมรวมทุกสมรภูมิ
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function VitalCard({ icon, label, value, color }) {
    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            borderBottom: `2px solid ${color}`
        }}>
            <div style={{ color, opacity: 0.8 }}>{icon}</div>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{value}</p>
            </div>
        </div>
    );
}

function MissionItem({ title, time, status, type }) {
    const getColor = () => {
        if (type === 'war') return 'var(--secondary)';
        if (type === 'boss') return 'var(--primary)';
        return '#4ade80';
    };

    return (
        <div style={{
            padding: '1.2rem',
            background: 'rgba(255,255,255,0.02)',
            borderLeft: `3px solid ${getColor()}`,
            borderRadius: '4px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold' }}>{title}</span>
                <span style={{ fontSize: '0.8rem', color: getColor(), fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {time}
                </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{status}</p>
        </div>
    );
}

function LogEntry({ name, action, detail, time }) {
    return (
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{name}</div>
            <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--text-main)', opacity: 0.8 }}>{action}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>[{detail}]</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{time}</div>
        </div>
    );
}

function TopWarrior({ rank, name, score }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: rank === 1 ? 'rgba(194,147,61,0.05)' : 'transparent', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: rank === 1 ? 'var(--primary)' : rank === 2 ? 'silver' : rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 'bold', color: rank <= 3 ? '#000' : 'var(--text-main)'
                }}>
                    {rank}
                </div>
                <span style={{ fontWeight: '500' }}>{name}</span>
            </div>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{score}</span>
        </div>
    );
}
