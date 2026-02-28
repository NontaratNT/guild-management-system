import { useState, useMemo, useEffect } from 'react';
import { useMembers } from '../context/MemberContext';
import { useActivities } from '../context/ActivityContext';
import { Swords, Trophy, Clock, Users, Shield, Target, AlertTriangle, TrendingUp, History, UserCheck, UserX, Crown, X, Edit2 } from 'lucide-react';

export default function GuildWar() {
    const [activeTab, setActiveTab] = useState('current');
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        memberName: '',
        attacksUsed: 0,
        wins: 0,
        losses: 0,
        defense: 0
    });

    // War Data & Summaries with Local Storage Persistence
    const {
        warData, updateWarData,
        warSummaries, updateWarSummaries
    } = useActivities();

    const setWarData = (newData) => {
        if (typeof newData === 'function') {
            updateWarData(newData(warData));
        } else {
            updateWarData(newData);
        }
    };

    const setWarSummaries = (newData) => {
        if (typeof newData === 'function') {
            updateWarSummaries(newData(warSummaries));
        } else {
            updateWarSummaries(newData);
        }
    };

    const [isSummaryFormOpen, setIsSummaryFormOpen] = useState(false);
    const [summaryFormData, setSummaryFormData] = useState({
        date: '',
        result: 'Win',
        score: '',
        opponent: ''
    });

    const handleOpenSummaryForm = (date) => {
        const existing = warSummaries[selectedSeason]?.[date] || { result: 'Win', score: '', opponent: '' };
        setSummaryFormData({ date, ...existing });
        setIsSummaryFormOpen(true);
    };

    const handleSaveSummary = (e) => {
        e.preventDefault();
        const newSummaries = { ...warSummaries };
        if (!newSummaries[selectedSeason]) newSummaries[selectedSeason] = {};
        newSummaries[selectedSeason][summaryFormData.date] = {
            result: summaryFormData.result,
            score: summaryFormData.score,
            opponent: summaryFormData.opponent
        };
        setWarSummaries(newSummaries);
        setIsSummaryFormOpen(false);
    };

    const { members } = useMembers();

    // Helper to check if date is Sat, Mon, Wed
    const isValidWarDay = (dateStr) => {
        const day = new Date(dateStr).getDay();
        return [1, 3, 6].includes(day); // 1=Mon, 3=Wed, 6=Sat
    };

    const currentDayData = useMemo(() => {
        return warData[selectedSeason]?.[selectedDate] || [];
    }, [warData, selectedSeason, selectedDate]);

    const seasonStats = useMemo(() => {
        const stats = {};
        const seasonDays = warData[selectedSeason] || {};
        Object.values(seasonDays).forEach(dayRecords => {
            dayRecords.forEach(rec => {
                if (!stats[rec.name]) stats[rec.name] = { wins: 0, losses: 0, attacks: 0, score: 0 };
                stats[rec.name].wins += rec.wins;
                stats[rec.name].losses += rec.losses;
                stats[rec.name].attacks += rec.attacksUsed;
                stats[rec.name].score += (rec.wins * 30) + (rec.losses * 10);
            });
        });
        return stats;
    }, [warData, selectedSeason]);

    const membersStatus = useMemo(() => {
        const d = new Date(selectedDate);
        return members.filter(m => {
            const joinDate = new Date(m.joinDate);
            const deathDate = m.deathDate ? new Date(m.deathDate) : null;
            return d >= joinDate && (!deathDate || d <= deathDate);
        }).map((m, index) => {
            const daily = currentDayData.find(d => d.name === m.name) || { wins: 0, losses: 0, attacksUsed: 0, defense: 0 };
            const season = seasonStats[m.name] || { wins: 0, losses: 0, score: 0 };
            return {
                ...m,
                rank: index + 1,
                wins: daily.wins,
                losses: daily.losses,
                attacksUsed: daily.attacksUsed,
                totalAttacks: 5,
                defense: daily.defense,
                score: season.score,
                seasonScore: season.score.toLocaleString()
            };
        });
    }, [members, currentDayData, seasonStats]);

    const handleSaveRecord = (e) => {
        e.preventDefault();
        const newWarData = { ...warData };
        if (!newWarData[selectedSeason]) newWarData[selectedSeason] = {};
        if (!newWarData[selectedSeason][selectedDate]) newWarData[selectedSeason][selectedDate] = [];

        const index = newWarData[selectedSeason][selectedDate].findIndex(r => r.name === formData.memberName);
        const record = { ...formData, id: Date.now(), name: formData.memberName };

        if (index >= 0) {
            newWarData[selectedSeason][selectedDate][index] = record;
        } else {
            newWarData[selectedSeason][selectedDate].push(record);
        }

        setWarData(newWarData);
        setIsFormOpen(false);
    };

    const daySummary = warSummaries[selectedSeason]?.[selectedDate] || { opponent: 'Shadow Legion (Lv. 14)', result: 'Pending', score: '-' };

    const currentWar = {
        opponent: daySummary.opponent,
        result: daySummary.result,
        score: daySummary.score,
        status: "In Progress",
        timeLeft: "04:22:15",
        ourScore: currentDayData.reduce((acc, curr) => acc + (curr.wins * 30) + (curr.losses * 10), 0),
        opponentScore: 3900,
        winProbability: "62%",
        totalAttacks: members.length * 5,
        attacksUsed: currentDayData.reduce((acc, curr) => acc + curr.attacksUsed, 0),
        buffs: ["Atk +5%", "Def +5%"]
    };

    return (
        <div style={{ marginLeft: '320px', padding: '100px 40px 40px' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>สมรภูมิกิลด์วอร์</h1>
                    <p style={{ color: 'var(--text-muted)' }}>ศูนย์บัญชาการแผนการรบและการชิงชัยเหนืออริศัตรู (สป./จ./พ.)</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ padding: '0.3rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Season</label>
                        <select
                            value={selectedSeason}
                            onChange={e => setSelectedSeason(parseInt(e.target.value))}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', outline: 'none' }}
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                        </select>
                    </div>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="input-field"
                        style={{ padding: '0.5rem', width: 'auto', fontSize: '0.9rem' }}
                    />

                    <button
                        className="btn btn-primary"
                        onClick={() => setIsFormOpen(true)}
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                    >
                        <Shield size={18} /> จารึกผลการรบ
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'current' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('current')}
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                >
                    <Swords size={18} /> ศึกปัจจุบัน
                </button>
                <button
                    className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('history')}
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                >
                    <History size={18} /> ปูมหลังสงคราม
                </button>
            </div>

            {!isValidWarDay(selectedDate) && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', border: '1px solid var(--secondary)', textAlign: 'center', color: 'var(--secondary)' }}>
                    <AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    วันที่เลือกไม่ใช่คุณสมบัติของวันกิลด์วอร์ (กรุณาเลือกวันเสาร์, จันทร์ หรือพุธ)
                </div>
            )}

            {activeTab === 'current' ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        {/* Member Participation */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 className="text-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Users size={20} /> ข้อมูลอันดับและการออกรบ
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {membersStatus.map(m => (
                                    <ParticipationCard key={m.id} member={m} />
                                ))}
                            </div>
                        </div>

                        {/* War Intelligence */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h3 className="text-gold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Target size={20} /> ยุทธศาสตร์ปัจจุบัน
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', background: 'rgba(194,147,61,0.05)', borderRadius: '4px', borderLeft: '3px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>กิลด์คู่แข่ง</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{currentWar.opponent}</div>
                                            {currentWar.score !== '-' && (
                                                <div style={{ fontSize: '1rem', color: 'var(--text-gold)', marginTop: '0.2rem' }}>
                                                    {currentWar.result}: {currentWar.score}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleOpenSummaryForm(selectedDate)}
                                            className="btn-icon"
                                            style={{ background: 'rgba(255,255,255,0.05)' }}
                                            title="จารึกผลคะแนนกิลด์"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </div>

                                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                            <span>การออกไม้ (Attacks Used)</span>
                                            <span>{currentWar.attacksUsed} / {currentWar.totalAttacks}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(currentWar.attacksUsed / currentWar.totalAttacks) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#facc15', marginBottom: '1rem' }}>
                                    <AlertTriangle size={20} />
                                    <h4 style={{ margin: 0 }}>คำเตือนจากแม่ทัพ</h4>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                    เหล่านักรบที่ยังไม่ได้ออกไม้ โปรดเร่งมือ! เราต้องการคะแนนอีกเพียงเล็กน้อยเพื่อสร้างความห่างที่แน่นอน เตรียมตัวให้พร้อมก่อนสงครามสิ้นสุด
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="text-gold" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <History size={20} /> ประวัติการทำศึก
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.keys(warData[selectedSeason] || {}).sort().reverse().map(date => {
                            const summary = warSummaries[selectedSeason]?.[date] || { result: 'Pending', score: '-', opponent: 'Unknown Enemy' };
                            return (
                                <div key={date} style={{
                                    padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderLeft: `4px solid ${summary.result === 'Win' ? '#4ade80' : summary.result === 'Loss' ? 'var(--secondary)' : 'var(--text-muted)'}`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            {summary.opponent} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>({date})</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            จารึกโดยนักรบ {warData[selectedSeason][date].length} ท่าน
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontWeight: 'bold', fontSize: '1.1rem',
                                                color: summary.result === 'Win' ? '#4ade80' : summary.result === 'Loss' ? 'var(--secondary)' : 'var(--text-muted)',
                                                marginBottom: '0.2rem'
                                            }}>
                                                {summary.result.toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-gold)', opacity: 0.8 }}>{summary.score}</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleOpenSummaryForm(date)}
                                                className="btn-icon"
                                                title="แก้ไขผลคะแนนรวม"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedDate(date); setActiveTab('current'); }}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}
                                            >
                                                นักรบรายบุคคล
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Guild Summary Form Modal */}
            {isSummaryFormOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 className="text-gold">จารึกผลคะแนนรวมกิลด์</h3>
                            <button className="btn-icon" onClick={() => setIsSummaryFormOpen(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSaveSummary}>
                            <div className="input-group">
                                <label>วันที่</label>
                                <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{summaryFormData.date}</div>
                            </div>

                            <div className="input-group">
                                <label>กิลด์คู่แข่ง</label>
                                <input
                                    type="text" className="input-field"
                                    value={summaryFormData.opponent}
                                    onChange={e => setSummaryFormData({ ...summaryFormData, opponent: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>สถานะ</label>
                                <select
                                    className="input-field"
                                    value={summaryFormData.result}
                                    onChange={e => setSummaryFormData({ ...summaryFormData, result: e.target.value })}
                                >
                                    <option value="Win">ชนะ (WIN)</option>
                                    <option value="Loss">แพ้ (LOSS)</option>
                                    <option value="Draw">เสมอ (DRAW)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>แต้มที่กิลด์ทำได้</label>
                                <input
                                    type="text" className="input-field"
                                    placeholder="เช่น 5,200 - 4,800"
                                    value={summaryFormData.score}
                                    onChange={e => setSummaryFormData({ ...summaryFormData, score: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                <Trophy size={18} /> บันทึกจารึกรวม
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Form Modal */}
            {isFormOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 className="text-gold">จารึกผลการรบรายวัน</h3>
                            <button className="btn-icon" onClick={() => setIsFormOpen(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSaveRecord}>
                            <div className="input-group">
                                <label>นักรบ</label>
                                <select
                                    className="input-field"
                                    value={formData.memberName}
                                    onChange={e => setFormData({ ...formData, memberName: e.target.value })}
                                    required
                                >
                                    <option value="">เลือกนักรบ...</option>
                                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>ไม้ที่ใช้ (0-5)</label>
                                    <input
                                        type="number" className="input-field" min="0" max="5"
                                        value={formData.attacksUsed}
                                        onChange={e => setFormData({ ...formData, attacksUsed: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>คะแนนป้องกัน</label>
                                    <input
                                        type="number" className="input-field"
                                        value={formData.defense}
                                        onChange={e => setFormData({ ...formData, defense: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>ชนะ</label>
                                    <input
                                        type="number" className="input-field" min="0" max="5"
                                        value={formData.wins}
                                        onChange={e => setFormData({ ...formData, wins: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>แพ้</label>
                                    <input
                                        type="number" className="input-field" min="0" max="5"
                                        value={formData.losses}
                                        onChange={e => setFormData({ ...formData, losses: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                <History size={18} /> บันทึกจารึก
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ParticipationCard({ member }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 180px',
            alignItems: 'center',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Left: Rank */}
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.3)',
                background: 'rgba(0,0,0,0.2)',
                fontFamily: 'Cinzel, serif',
                borderRight: '1px solid rgba(255,255,255,0.05)'
            }}>
                {member.rank}
            </div>

            {/* Middle: Info */}
            <div style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    border: '2px solid var(--primary)', padding: '3px',
                    background: 'rgba(0,0,0,0.3)'
                }}>
                    <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        background: 'linear-gradient(45deg, var(--secondary), var(--primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users size={24} style={{ opacity: 0.5 }} />
                    </div>
                </div>

                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ชนะ <span style={{ color: '#4ade80' }}>{member.wins}</span> แพ้ <span style={{ color: 'var(--secondary)' }}>{member.losses}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {member.score} คะแนน [คะแนนในซีซั่น {member.seasonScore} คะแนน]
                    </div>
                </div>
            </div>

            {/* Right: Actions/Defense */}
            <div style={{ padding: '0.8rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {[...Array(member.totalAttacks)].map((_, i) => (
                        <Swords
                            key={i}
                            size={18}
                            style={{
                                color: i < (member.totalAttacks - member.attacksUsed) ? '#60a5fa' : 'rgba(255,255,255,0.1)',
                                transform: 'rotate(-45deg)'
                            }}
                        />
                    ))}
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(96, 165, 250, 0.2)', padding: '0.2rem 1.5rem',
                    borderRadius: '20px', border: '1px solid rgba(96, 165, 250, 0.3)',
                    color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem', width: '100%', justifyContent: 'center'
                }}>
                    <Shield size={14} /> {member.defense}
                </div>
            </div>
        </div>
    );
}
