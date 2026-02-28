import { useState, useMemo, useRef, useEffect } from 'react';
import { useMembers } from '../context/MemberContext';
import { useActivities } from '../context/ActivityContext';
import { Flame, Trophy, User, Search, AlertCircle, Shield, Plus, X, Edit2, Trash2, BarChart3, Medal, Crown, Camera, Zap, Skull, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';

const REBIRTH_BOSSES = ['ไคล์', 'ยอนฮี', 'คาร์ม่า', 'แทโอ'];
const DESTROYER_BOSSES = ['เทพทำลายล้าง'];
const ALL_BOSSES = [...REBIRTH_BOSSES, ...DESTROYER_BOSSES];
const SEASON_START_DATE = new Date('2024-01-01');

export default function RebirthBoss() {
    const { members } = useMembers();
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'summary'
    const [growthSearch, setGrowthSearch] = useState('');
    const [filterBoss, setFilterBoss] = useState('all');
    const [listSortOrder, setListSortOrder] = useState('desc'); // 'desc' or 'asc'
    const [isExporting, setIsExporting] = useState(false);
    const [compareSeasonA, setCompareSeasonA] = useState(1);
    const [compareSeasonB, setCompareSeasonB] = useState(1);
    const exportRef = useRef(null);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ member: '', boss: 'ไคล์', count: 1, score: 0, date: new Date().toISOString().split('T')[0] });



    // Data persistence with Local Storage
    const { rebirthData: seasonData, updateRebirthData } = useActivities();

    const setSeasonData = (newData) => {
        if (typeof newData === 'function') {
            updateRebirthData(newData(seasonData));
        } else {
            updateRebirthData(newData);
        }
    };

    const currentSeasonRecords = seasonData[selectedSeason] || [];

    const getSeasonDates = (num) => {
        const start = new Date(SEASON_START_DATE);
        start.setDate(SEASON_START_DATE.getDate() + (num - 1) * 14);
        const end = new Date(start);
        end.setDate(start.getDate() + 13);
        return { start, end };
    };

    const { start: sStart, end: sEnd } = getSeasonDates(selectedSeason);

    // Aggregate Stats for current season
    const summaryStats = useMemo(() => {
        const stats = {};
        const { start, end } = getSeasonDates(selectedSeason);

        members.forEach(m => {
            const joinDate = new Date(m.joinDate);
            const deathDate = m.deathDate ? new Date(m.deathDate) : null;
            // Only include member if they joined before/during this season AND haven't died before it started
            const isActiveInSeason = joinDate <= end && (!deathDate || deathDate >= start);

            if (isActiveInSeason) {
                stats[m.name] = {
                    bossData: ALL_BOSSES.reduce((acc, b) => ({ ...acc, [b]: { score: 0, count: 0 } }), {}),
                    rebirthScore: 0,
                    destroyerScore: 0,
                    totalScore: 0,
                    totalHits: 0,
                    joinedInThisSeason: joinDate >= start && joinDate <= end
                };
            }
        });

        currentSeasonRecords.forEach(r => {
            const memberMeta = members.find(m => m.name === r.member);
            if (stats[r.member] && memberMeta) {
                const joinDate = new Date(memberMeta.joinDate);
                const recordDate = new Date(r.date || '2024-01-01');

                // Only count records AFTER or ON join date
                if (recordDate >= joinDate) {
                    stats[r.member].bossData[r.boss].score += r.score;
                    stats[r.member].bossData[r.boss].count += r.count;
                    stats[r.member].totalScore += r.score;
                    stats[r.member].totalHits += r.count;

                    if (REBIRTH_BOSSES.includes(r.boss)) {
                        stats[r.member].rebirthScore += r.score;
                    } else {
                        stats[r.member].destroyerScore += r.score;
                    }
                }
            }
        });

        return stats;
    }, [currentSeasonRecords, selectedSeason, members]);

    const growthStats = useMemo(() => {
        const seasons = Object.keys(seasonData).sort((a, b) => parseInt(a) - parseInt(b));
        return seasons.map((s, idx) => {
            const records = seasonData[s];
            const totalScore = records.reduce((sum, r) => sum + r.score, 0);
            const prevSeasonScore = idx > 0 ? seasonData[seasons[idx - 1]].reduce((sum, r) => sum + r.score, 0) : 0;
            const diff = totalScore - prevSeasonScore;
            const growth = prevSeasonScore > 0 ? (diff / prevSeasonScore) * 100 : 0;

            return {
                season: s,
                totalScore,
                growth: growth.toFixed(1),
                diff,
                hits: records.reduce((sum, r) => sum + r.count, 0)
            };
        });
    }, [seasonData]);

    const memberGrowthStats = useMemo(() => {
        const stats = {};
        const seasons = Object.keys(seasonData).sort((a, b) => parseInt(a) - parseInt(b));

        members.forEach(m => {
            const joinDate = new Date(m.joinDate);
            stats[m.name] = seasons.map((s, idx) => {
                const { end } = getSeasonDates(parseInt(s));

                // If member hadn't joined yet by end of season, mark as N/A or empty
                if (joinDate > end) return { season: s, score: 0, growth: 0, diff: 0, inactive: true };

                const records = seasonData[s].filter(r => {
                    const rDate = new Date(r.date || '2024-01-01');
                    return r.member === m.name && rDate >= joinDate;
                });
                const score = records.reduce((sum, r) => sum + r.score, 0);

                let prevScore = 0;
                if (idx > 0) {
                    const prevSeasonNum = seasons[idx - 1];
                    const prevEndDate = getSeasonDates(parseInt(prevSeasonNum)).end;

                    if (joinDate <= prevEndDate) {
                        prevScore = seasonData[prevSeasonNum]
                            .filter(r => {
                                const rDate = new Date(r.date || '2024-01-01');
                                return r.member === m.name && rDate >= joinDate;
                            })
                            .reduce((sum, r) => sum + r.score, 0);
                    }
                }

                const diff = score - prevScore;
                const growth = prevScore > 0 ? (diff / prevScore) * 100 : 0;

                return { season: s, score, growth, diff, inactive: false };
            });
        });
        return stats;
    }, [seasonData, members]);

    const customComparison = useMemo(() => {
        const recordsA = seasonData[compareSeasonA] || [];
        const recordsB = seasonData[compareSeasonB] || [];

        const scoreA = recordsA.reduce((sum, r) => sum + r.score, 0);
        const scoreB = recordsB.reduce((sum, r) => sum + r.score, 0);
        const hitsA = recordsA.reduce((sum, r) => sum + r.count, 0);
        const hitsB = recordsB.reduce((sum, r) => sum + r.count, 0);

        const diff = scoreB - scoreA;
        const growth = scoreA > 0 ? (diff / scoreA) * 100 : 0;

        const memberDiffs = members.map(m => {
            const joinDate = new Date(m.joinDate);
            const { end: endA } = getSeasonDates(compareSeasonA);
            const { end: endB } = getSeasonDates(compareSeasonB);

            // Season A stats
            const sAScore = joinDate > endA ? 0 : recordsA
                .filter(r => r.member === m.name && new Date(r.date || '2024-01-01') >= joinDate)
                .reduce((sum, r) => sum + r.score, 0);

            // Season B stats
            const sBScore = joinDate > endB ? 0 : recordsB
                .filter(r => r.member === m.name && new Date(r.date || '2024-01-01') >= joinDate)
                .reduce((sum, r) => sum + r.score, 0);

            const mDiff = sBScore - sAScore;
            const mGrowth = sAScore > 0 ? (mDiff / sAScore) * 100 : 0;

            return {
                name: m.name,
                scoreA: sAScore,
                scoreB: sBScore,
                diff: mDiff,
                growth: mGrowth,
                joinedA: joinDate <= endA,
                joinedB: joinDate <= endB
            };
        });

        return { scoreA, scoreB, hitsA, hitsB, diff, growth, memberDiffs };
    }, [seasonData, compareSeasonA, compareSeasonB, members]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const newSeasonData = { ...seasonData };
        if (!newSeasonData[selectedSeason]) newSeasonData[selectedSeason] = [];

        const timestamp = new Date().toISOString().split('T')[0];

        if (isEditMode) {
            newSeasonData[selectedSeason] = newSeasonData[selectedSeason].map(r =>
                r.id === editingId ? { ...formData, id: editingId, date: r.date || timestamp } : r
            );
        } else {
            const newEntry = { ...formData, id: Date.now(), date: timestamp };
            newSeasonData[selectedSeason].push(newEntry);
        }

        setSeasonData(newSeasonData);
        setIsFormOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('ต้องการลบข้อมูลนี้หรือไม่?')) {
            const newSeasonData = { ...seasonData };
            newSeasonData[selectedSeason] = newSeasonData[selectedSeason].filter(r => r.id !== id);
            setSeasonData(newSeasonData);
        }
    };

    const handleOpenForm = (record = null) => {
        if (record) {
            setFormData(record);
            setEditingId(record.id);
            setIsEditMode(true);
        } else {
            setFormData({ member: members[0]?.name || '', boss: ALL_BOSSES[0], count: 1, score: 0, date: new Date().toISOString().split('T')[0] });
            setIsEditMode(false);
        }
        setIsFormOpen(true);
    };

    const handleExport = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(exportRef.current, { backgroundColor: '#0a0a0a', scale: 2 });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `rebirth-season-${selectedSeason}.png`;
            link.click();
        } finally {
            setIsExporting(false);
        }
    };

    const filteredRecords = useMemo(() => {
        return currentSeasonRecords
            .filter(r => {
                const matchesSearch = r.member.toLowerCase().includes(search.toLowerCase());
                const matchesBoss = filterBoss === 'all' || r.boss === filterBoss;
                return matchesSearch && matchesBoss;
            })
            .sort((a, b) => {
                if (listSortOrder === 'desc') return b.score - a.score;
                return a.score - b.score;
            });
    }, [currentSeasonRecords, search, filterBoss, listSortOrder]);

    const overallTotal = currentSeasonRecords.reduce((acc, r) => ({
        score: acc.score + r.score,
        rScore: acc.rScore + (REBIRTH_BOSSES.includes(r.boss) ? r.score : 0),
        dScore: acc.dScore + (DESTROYER_BOSSES.includes(r.boss) ? r.score : 0),
        hits: acc.hits + r.count
    }), { score: 0, rScore: 0, dScore: 0, hits: 0 });

    return (
        <div style={{ marginLeft: '320px', padding: '100px 40px 40px' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>วิหารแห่งการจุติ (Season Mode)</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="glass-panel" style={{ display: 'flex', padding: '0.4rem', gap: '0.4rem', alignItems: 'center' }}>
                            <button onClick={() => setSelectedSeason(Math.max(1, selectedSeason - 1))} className="btn btn-secondary" style={{ padding: '0.2rem' }}><ChevronLeft size={16} /></button>
                            <span style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>ซีซั่น {selectedSeason}</span>
                            <button onClick={() => setSelectedSeason(selectedSeason + 1)} className="btn btn-secondary" style={{ padding: '0.2rem' }}><ChevronRight size={16} /></button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {sStart.toLocaleDateString('th-TH')} - {sEnd.toLocaleDateString('th-TH')}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={handleExport} disabled={isExporting}>
                        <Camera size={18} /> {isExporting ? 'กำลังจารึก...' : 'บันทึกรูป'}
                    </button>
                    <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px' }}>
                        <button onClick={() => setActiveTab('list')} className={`btn ${activeTab === 'list' ? 'btn-primary' : ''}`} style={{ background: activeTab === 'list' ? '' : 'transparent', color: activeTab === 'list' ? '' : 'var(--text-muted)' }}>รายการจารึก</button>
                        <button onClick={() => setActiveTab('summary')} className={`btn ${activeTab === 'summary' ? 'btn-primary' : ''}`} style={{ background: activeTab === 'summary' ? '' : 'transparent', color: activeTab === 'summary' ? '' : 'var(--text-muted)' }}>ทำเนียบซีซั่น</button>
                        <button onClick={() => setActiveTab('growth')} className={`btn ${activeTab === 'growth' ? 'btn-primary' : ''}`} style={{ background: activeTab === 'growth' ? '' : 'transparent', color: activeTab === 'growth' ? '' : 'var(--text-muted)' }}>วิวัฒนาการ</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenForm()}><Plus size={20} /> บันทึกงาน</button>
                </div>
            </header>

            <div ref={exportRef} style={{ padding: '1rem' }}>
                {activeTab === 'list' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 className="text-gold">รายการจารึกซีซั่น {selectedSeason}</h3>
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" placeholder="ค้นหาชื่อนักรบ..." className="input-field" style={{ paddingLeft: '38px', width: '180px' }} value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                    <select className="input-field" style={{ width: '130px' }} value={filterBoss} onChange={e => setFilterBoss(e.target.value)}>
                                        <option value="all">บอสทั้งหมด</option>
                                        {ALL_BOSSES.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <select className="input-field" style={{ width: '150px' }} value={listSortOrder} onChange={e => setListSortOrder(e.target.value)}>
                                        <option value="desc">คะแนน (มาก → น้อย)</option>
                                        <option value="asc">คะแนน (น้อย → มาก)</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredRecords.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>ยังไม่มีการจารึกในซีซั่นนี้</p>}
                                {filteredRecords.map((r) => (
                                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `4px solid ${REBIRTH_BOSSES.includes(r.boss) ? 'var(--primary)' : 'var(--secondary)'}` }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{r.member}</p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                <span>บอส: <span style={{ color: 'white' }}>{r.boss}</span></span>
                                                <span>จำนวน: <span style={{ color: 'white' }}>{r.count} รอบ</span></span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>คะแนน</p>
                                                <p className="text-gold" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{r.score.toLocaleString()}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleOpenForm(r)} className="btn btn-secondary" style={{ padding: '0.5rem' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(r.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--secondary)' }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                            <h4 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>ภาพรวมซีซั่น {selectedSeason}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <SummaryItem label="คะแนนรวม" value={overallTotal.score.toLocaleString()} icon={<Trophy size={16} />} />
                                <SummaryItem label="คะแนนจุติ" value={overallTotal.rScore.toLocaleString()} icon={<Zap size={16} />} color="var(--primary)" />
                                <SummaryItem label="คะแนนเทพทำลายล้าง" value={overallTotal.dScore.toLocaleString()} icon={<Skull size={16} />} color="var(--secondary)" />
                                <SummaryItem label="จำนวนการตีรวม" value={`${overallTotal.hits} ครั้ง`} icon={<Flame size={16} />} />
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'growth' ? (
                    <div className="glass-panel animate-fade-up" style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                            <TrendingUp className="text-gold" size={32} />
                            <h2 className="text-gradient" style={{ fontSize: '2rem', marginRight: '2rem' }}>วิชาวิวัฒนาการ (Growth Dashboard)</h2>

                            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.5rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>เปรียบเทียบ:</span>
                                <select className="input-field" style={{ width: '120px' }} value={compareSeasonA} onChange={e => setCompareSeasonA(parseInt(e.target.value))}>
                                    {Object.keys(seasonData).map(s => <option key={s} value={s}>ซีซั่น {s}</option>)}
                                </select>
                                <span style={{ color: 'var(--text-muted)' }}>กับ</span>
                                <select className="input-field" style={{ width: '120px' }} value={compareSeasonB} onChange={e => setCompareSeasonB(parseInt(e.target.value))}>
                                    {Object.keys(seasonData).map(s => <option key={s} value={s}>ซีซั่น {s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Custom Comparison Summary */}
                        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', marginBottom: '4rem', background: 'linear-gradient(135deg, rgba(194,147,61,0.05) 0%, rgba(140,42,42,0.05) 100%)', border: '1px solid rgba(194,147,61,0.2)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto minmax(200px, 1fr)', gap: '3rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ซีซั่น {compareSeasonA}</p>
                                    <h3 style={{ fontSize: '2.5rem' }}>{customComparison.scoreA.toLocaleString()}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customComparison.hitsA} ครั้ง</p>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        padding: '0.5rem 1.5rem', borderRadius: '30px',
                                        background: customComparison.growth >= 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: customComparison.growth >= 0 ? '#4ade80' : '#ef4444',
                                        fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem'
                                    }}>
                                        {customComparison.growth >= 0 ? '↑' : '↓'} {Math.abs(customComparison.growth).toFixed(1)}%
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {customComparison.diff >= 0 ? 'กำไร' : 'ขาดทุน'} {Math.abs(customComparison.diff).toLocaleString()} แต้ม
                                    </p>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ซีซั่น {compareSeasonB}</p>
                                    <h3 style={{ fontSize: '2.5rem' }} className="text-gold">{customComparison.scoreB.toLocaleString()}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customComparison.hitsB} ครั้ง</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '4rem' }}>
                            <h4 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>สรุปแนวโน้มรายซีซั่น</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {growthStats.map((s, i) => {
                                    const isPositive = parseFloat(s.growth) >= 0;
                                    return (
                                        <div key={i} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', opacity: 0.8 }}>
                                            <div style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '3rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.02)' }}>{s.season}</div>
                                            <div style={{ position: 'relative', zIndex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ซีซั่น {s.season}</span>
                                                    <span style={{ color: isPositive ? '#4ade80' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                        {i === 0 ? 'START' : `${isPositive ? '+' : ''}${s.growth}%`}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{s.totalScore.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Individual Growth Section */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <User className="text-gold" size={24} />
                                    <h3 style={{ fontSize: '1.5rem' }}>วิวัฒนาการรายบุคคล (เทียบซีซั่น {compareSeasonA} ⮕ {compareSeasonB})</h3>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหานักรบ..."
                                        className="input-field"
                                        style={{ paddingLeft: '38px', width: '250px' }}
                                        value={growthSearch}
                                        onChange={e => setGrowthSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {customComparison.memberDiffs.filter(m => m.name.toLowerCase().includes(growthSearch.toLowerCase())).map((m) => {
                                    if (!m.joinedA && !m.joinedB) return null;
                                    const isPositive = m.diff >= 0;

                                    return (
                                        <div key={m.name} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <span style={{ fontWeight: 'bold' }}>{m.name}</span>
                                                <div style={{
                                                    fontSize: '0.75rem', fontWeight: 'bold',
                                                    color: isPositive ? '#4ade80' : '#ef4444'
                                                }}>
                                                    {!m.joinedA ? 'NEW' : (m.growth === 0 && m.diff === 0 ? '-' : `${isPositive ? '+' : ''}${m.growth.toFixed(1)}%`)}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.scoreA.toLocaleString()}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⮕</span>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{m.scoreB.toLocaleString()}</span>
                                            </div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {!m.joinedA ? `เข้าร่วมในซีซั่น {compareSeasonB}` : (m.diff > 0 ? `เพิ่มขึ้น ${m.diff.toLocaleString()}` :
                                                    m.diff < 0 ? `ลดลง ${Math.abs(m.diff).toLocaleString()}` : 'คงที่')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                            <Medal className="text-gold" size={32} />
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>นักรบ</th>
                                        {REBIRTH_BOSSES.map(b => (
                                            <th key={b} style={{ padding: '1rem' }}>
                                                <div>{b}</div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 'normal' }}>(รอบ/คะแนน)</div>
                                            </th>
                                        ))}
                                        <th style={{ color: 'var(--primary)', padding: '1rem' }}>รวมจุติ</th>
                                        <th style={{ color: 'var(--secondary)', padding: '1rem' }}>เทพทำลายล้าง</th>
                                        <th style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '1rem' }}>คะแนนรวมซีซั่น</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summaryStats).sort((a, b) => b[1].totalScore - a[1].totalScore).map(([name, s]) => (
                                        <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ textAlign: 'left', fontWeight: 'bold', padding: '1.2rem 1rem' }}>{name}</td>
                                            {REBIRTH_BOSSES.map(b => (
                                                <td key={b} style={{ padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.75rem', color: s.bossData[b].count > 0 ? 'white' : 'var(--text-muted)' }}>{s.bossData[b].count} รอบ</div>
                                                    <div style={{ fontSize: '0.85rem', color: s.bossData[b].score > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{s.bossData[b].score.toLocaleString()}</div>
                                                </td>
                                            ))}
                                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{s.rebirthScore.toLocaleString()}</td>
                                            <td style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{s.destroyerScore.toLocaleString()}</td>
                                            <td style={{ background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', fontSize: '1.1rem' }} className="text-gold">{s.totalScore.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel animate-fade-up" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 className="text-gold">{isEditMode ? 'แก้ไขการจารึก' : 'จารึกผลงานซีซั่น'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="btn btn-secondary" style={{ padding: '0.5rem' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="input-group">
                                <label>นักรบ</label>
                                <select className="input-field" value={formData.member} onChange={e => setFormData({ ...formData, member: e.target.value })} disabled={isEditMode}>
                                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>เลือกบอส</label>
                                <select className="input-field" value={formData.boss} onChange={e => setFormData({ ...formData, boss: e.target.value })}>
                                    {ALL_BOSSES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>จำนวนรอบ</label>
                                    <input type="number" className="input-field" value={formData.count} onChange={e => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })} min="1" />
                                </div>
                                <div className="input-group">
                                    <label>คะแนนรวมที่ทำได้</label>
                                    <input type="number" className="input-field" value={formData.score} onChange={e => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>ยืนยันจารึก</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryItem({ label, value, icon, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {label}</span>
            <span style={{ fontWeight: 'bold', color: color || 'inherit' }}>{value}</span>
        </div>
    );
}
