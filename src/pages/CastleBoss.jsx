import { useState, useMemo, useRef, useEffect } from 'react';
import { useMembers } from '../context/MemberContext';
import { useActivities } from '../context/ActivityContext';
import html2canvas from 'html2canvas';
import { Swords, Trophy, Calendar as CalendarIcon, User, Search, AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, Shield, Plus, X, Edit2, Trash2, BarChart3, Medal, Crown, Camera, Download } from 'lucide-react';

export default function CastleBoss() {
    const { members } = useMembers();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [search, setSearch] = useState('');

    // Tabs for switching between daily view and aggregate stats
    const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'leaderboard'
    const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);
    const [searchHallOfFame, setSearchHallOfFame] = useState('');
    const [sortOption, setSortOption] = useState('weeklyTotal'); // 'weeklyTotal', 'absences', 'name', 'joinDate'
    const exportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ member: '', score: 0 });

    // Data persistence with Local Storage
    const { castleData: allRecords, updateCastleData } = useActivities();

    const setAllRecords = (newData) => {
        if (typeof newData === 'function') {
            updateCastleData(newData(allRecords));
        } else {
            updateCastleData(newData);
        }
    };



    const formatDate = (date) => date.toISOString().split('T')[0];
    const dateStr = formatDate(selectedDate);
    const dayRecords = allRecords[dateStr] || [];

    // Aggregation Logic (Memoized for performance)
    const aggregateStats = useMemo(() => {
        const stats = {};
        const now = new Date();
        const currM = now.getMonth();
        const currY = now.getFullYear();
        const totalDaysRecorded = Object.keys(allRecords).length;

        // Current Week Range (Mon-Sun)
        const weekDates = [];
        const current = new Date();
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(current.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDates.push(formatDate(d));
        }

        Object.entries(allRecords).forEach(([dStr, records]) => {
            const [y, m, d] = dStr.split('-').map(Number);

            records.forEach(r => {
                if (!stats[r.member]) {
                    stats[r.member] = {
                        weeklyTotal: 0,
                        totalParticipations: 0,
                        absences: 0,
                        weeklyHits: [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
                    };
                }

                if (r.score > 0) {
                    stats[r.member].totalParticipations += 1;

                    // Check if date is in current week
                    const weekIdx = weekDates.indexOf(dStr);
                    if (weekIdx !== -1) {
                        stats[r.member].weeklyHits[weekIdx] = r.score;
                        stats[r.member].weeklyTotal += r.score;
                    }
                }
            });
        });

        members.forEach(m => {
            const name = m.name;
            const joinDate = new Date(m.joinDate);

            // Only count days that were recorded and are >= join date
            const recordedDaysAfterJoin = Object.keys(allRecords).filter(dStr => {
                const d = new Date(dStr);
                return d >= joinDate;
            }).length;

            if (!stats[name]) {
                stats[name] = {
                    weeklyTotal: 0,
                    totalParticipations: 0,
                    absences: recordedDaysAfterJoin,
                    weeklyHits: [0, 0, 0, 0, 0, 0, 0],
                    joinDate: m.joinDate
                };
            } else {
                stats[name].absences = Math.max(0, recordedDaysAfterJoin - stats[name].totalParticipations);
                stats[name].joinDate = m.joinDate;
            }
        });

        return stats;
    }, [allRecords, members]);

    // Form Handlers
    const handleOpenForm = (existingRecord = null) => {
        if (existingRecord) {
            setFormData(existingRecord);
            setIsEditMode(true);
        } else {
            setFormData({ member: members[0]?.name || '', score: 0 });
            setIsEditMode(false);
        }
        setIsFormOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const updatedDayRecords = [...dayRecords];
        const index = updatedDayRecords.findIndex(r => r.member === formData.member);

        if (index !== -1) {
            updatedDayRecords[index] = { ...formData };
        } else {
            updatedDayRecords.push({ ...formData });
        }

        setAllRecords({
            ...allRecords,
            [dateStr]: updatedDayRecords
        });
        setIsFormOpen(false);
    };

    const handleDeleteRecord = (memberName) => {
        if (window.confirm(`ลบบันทึกของ ${memberName} หรือไม่?`)) {
            setAllRecords({
                ...allRecords,
                [dateStr]: dayRecords.filter(r => r.member !== memberName)
            });
        }
    };

    const handleExportImage = async () => {
        if (!exportRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(exportRef.current, {
                backgroundColor: '#0a0a0a',
                scale: 2, // High quality
                useCORS: true,
                logging: false,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `castle-boss-${activeTab}-${new Date().toLocaleDateString()}.png`;
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('ไม่สามารถส่งออกรูปภาพได้ กรุณาลองใหม่');
        } finally {
            setIsExporting(false);
        }
    };

    const getDailyStatus = (d) => {
        const dStr = formatDate(d);
        const records = allRecords[dStr] || [];
        const score = records.reduce((sum, r) => sum + r.score, 0);
        const participantsCount = records.filter(r => r.score > 0).length;
        const validMembersAtDate = members.filter(m => {
            const joinDate = new Date(m.joinDate);
            const deathDate = m.deathDate ? new Date(m.deathDate) : null;
            return d >= joinDate && (!deathDate || d <= deathDate);
        });
        const missing = validMembersAtDate.length - participantsCount;
        return { score, missing, participantsCount };
    };

    const getMemberHistory = (name) => {
        return Object.entries(allRecords)
            .map(([date, records]) => {
                const record = records.find(r => r.member === name);
                return { date, score: record ? record.score : 0 };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Calendar Logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const monthDays = [];
    const totalDays = daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    for (let i = 0; i < firstDayOfMonth; i++) monthDays.push(null);
    for (let i = 1; i <= totalDays; i++) monthDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

    const changeMonth = (offset) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const selectedDayFullStats = members.filter(m => {
        const joinDate = new Date(m.joinDate);
        const deathDate = m.deathDate ? new Date(m.deathDate) : null;
        const d = selectedDate;
        return d >= joinDate && (!deathDate || d <= deathDate);
    }).map(m => {
        const record = dayRecords.find(r => r.member === m.name);
        return record || { member: m.name, score: 0 };
    }).filter(r => r.member.toLowerCase().includes(search.toLowerCase()));

    const dailyOverall = getDailyStatus(selectedDate);
    const maxScore = Math.max(...selectedDayFullStats.map(r => r.score), 1000);

    return (
        <div style={{ marginLeft: '320px', padding: '100px 40px 40px' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>ศูนย์บัญชาการพิทักษ์ปราสาท</h1>
                    <p style={{ color: 'var(--text-muted)' }}>บันทึกผลการบุกและวิเคราะห์ศักยภาพนักรบ Yukisama</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={handleExportImage} disabled={isExporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isExporting ? <div className="spinner"></div> : <Camera size={18} />}
                        {isExporting ? 'กำลังบันทึก...' : 'บันทึกเป็นรูป'}
                    </button>
                    <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px' }}>
                        <button
                            onClick={() => setActiveTab('daily')}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                background: activeTab === 'daily' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'daily' ? 'white' : 'var(--text-muted)',
                                fontSize: '0.9rem', fontWeight: 'bold', transition: '0.3s'
                            }}
                        >พิทักษ์รายวัน</button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                                background: activeTab === 'leaderboard' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'leaderboard' ? 'white' : 'var(--text-muted)',
                                fontSize: '0.9rem', fontWeight: 'bold', transition: '0.3s'
                            }}
                        >จารึกเกียรติยศ</button>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenForm()}>
                        <Plus size={20} /> บันทึกใหม่
                    </button>
                </div>
            </header>

            {/* Form Modal */}
            {isFormOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="glass-panel animate-fade-up" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 className="text-gold">{isEditMode ? 'แก้ไขจารึก' : 'บันทึกรายวัน'}</h2>
                            <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="input-group">
                                <label>นักรบ (บันทึกได้วันละครั้ง)</label>
                                <select className="input-field" value={formData.member} onChange={e => setFormData({ ...formData, member: e.target.value })} disabled={isEditMode}>
                                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>คะแนนปราสาทที่ทำได้</label>
                                <input type="number" className="input-field" value={formData.score} onChange={e => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>ยืนยันจารึก</button>
                        </form>
                    </div>
                </div>
            )}

            <div ref={exportRef} style={{ padding: '1rem' }}>
                {activeTab === 'daily' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Calendar */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 className="text-gold">{currentMonth.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => changeMonth(-1)} className="btn btn-secondary" style={{ padding: '0.4rem' }}><ChevronLeft size={18} /></button>
                                        <button onClick={() => changeMonth(1)} className="btn btn-secondary" style={{ padding: '0.4rem' }}><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                                    {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(d => <div key={d} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{d}</div>)}
                                    {monthDays.map((date, idx) => {
                                        if (!date) return <div key={idx}></div>;
                                        const isSelected = formatDate(date) === dateStr;
                                        const stats = getDailyStatus(date);
                                        return (
                                            <div key={idx} onClick={() => setSelectedDate(date)} style={{
                                                aspectRatio: '1', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer',
                                                border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                                background: isSelected ? 'rgba(194,147,61,0.15)' : 'rgba(255,255,255,0.02)',
                                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
                                                minHeight: '65px'
                                            }}>
                                                <span style={{ fontSize: '0.75rem', alignSelf: 'flex-start', color: 'var(--text-muted)' }}>{date.getDate()}</span>
                                                {stats.score > 0 && (
                                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                            {stats.score >= 1000 ? `${(stats.score / 1000).toFixed(1)}k` : stats.score}
                                                        </div>
                                                        <div style={{ fontSize: '0.6rem', color: '#4ade80' }}>
                                                            {stats.participantsCount} ท่าน
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Daily List & Chart */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                    <h3 className="text-gold">สถิติวันที่ {selectedDate.getDate()} {selectedDate.toLocaleString('th-TH', { month: 'long' })}</h3>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" placeholder="ค้นหา..." className="input-field" style={{ paddingLeft: '32px', width: '200px' }} value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {members.map(m => m.name).filter(name => name.toLowerCase().includes(search.toLowerCase())).map((name, i) => {
                                            const r = dayRecords.find(rec => rec.member === name) || { member: name, score: 0 };
                                            return (
                                                <div key={i} style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: `3px solid ${r.score > 0 ? '#4ade80' : 'var(--secondary)'}`, display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: '600' }}>{r.member}</span>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <span style={{ color: r.score > 0 ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem' }}>{r.score.toLocaleString()}</span>
                                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                            <button onClick={() => handleOpenForm(r)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDeleteRecord(r.member)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={16} /> สัดส่วนผลงาน</h4>
                                        {selectedDayFullStats.slice(0, 5).map((r, i) => (
                                            <div key={i} style={{ marginBottom: '1.2rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}><span>{r.member}</span><span>{r.score.toLocaleString()}</span></div>
                                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}><div style={{ height: '100%', borderRadius: '3px', width: `${(r.score / maxScore) * 100}%`, background: 'linear-gradient(90deg, #8c2a2a, #c2933d)' }}></div></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>ภาพรวมวันนี้</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <SummaryRow label="คะแนนรวมกิลด์" value={dailyOverall.score.toLocaleString()} icon={<Trophy size={16} />} />
                                    <SummaryRow label="นักรบที่ขาด" value={dailyOverall.missing} icon={<AlertCircle size={16} />} danger={dailyOverall.missing > 0} />
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '2rem', borderTop: '2px solid var(--primary)' }}>
                                <h4 className="text-gold" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>อันดับรายสัปดาห์</h4>
                                {Object.entries(aggregateStats).sort((a, b) => b[1].weeklyTotal - a[1].weeklyTotal).slice(0, 3).map(([name, s], i) => (
                                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                        <span style={{ fontSize: '0.85rem' }}>{i + 1}. {name}</span>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{s.weeklyTotal.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel animate-fade-up" style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                            <Crown className="text-gold" size={32} />
                            <h2 className="text-gradient" style={{ fontSize: '2rem' }}>ทำเนียบศักดิ์ศรีนักรบ Yukisama</h2>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                            <div className="glass-panel" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1.5rem' }}>
                                <Search size={18} className="text-muted" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อนักรบในทำเนียบ..."
                                    className="input-field"
                                    style={{ border: 'none', background: 'transparent' }}
                                    value={searchHallOfFame}
                                    onChange={e => setSearchHallOfFame(e.target.value)}
                                />
                            </div>
                            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1.5rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>เรียงตาม:</span>
                                <select
                                    className="input-field"
                                    style={{ border: 'none', background: 'transparent', padding: '0', cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}
                                    value={sortOption}
                                    onChange={e => setSortOption(e.target.value)}
                                >
                                    <option value="weeklyTotal">คะแนนสัปดาห์นี้</option>
                                    <option value="absences">สถิติการขาด (น้อยไปมาก)</option>
                                    <option value="joinDate">วันที่เข้ากิลด์ (ใหม่ไปเก่า)</option>
                                    <option value="name">ชื่อ (ก-ฮ)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                            {Object.entries(aggregateStats)
                                .filter(([name]) => name.toLowerCase().includes(searchHallOfFame.toLowerCase()))
                                .sort((a, b) => {
                                    if (sortOption === 'weeklyTotal') return b[1].weeklyTotal - a[1].weeklyTotal;
                                    if (sortOption === 'absences') return a[1].absences - b[1].absences;
                                    if (sortOption === 'name') return a[0].localeCompare(b[0], 'th');
                                    if (sortOption === 'joinDate') return new Date(b[1].joinDate) - new Date(a[1].joinDate);
                                    return 0;
                                })
                                .map(([name, s]) => (
                                    <div key={name} className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                            <div style={{ width: '50px', height: '50px', background: 'var(--surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Shield className="text-gold" size={24} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem' }}>{name}</h3>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เข้าร่วมกิลด์เมื่อ: {s.joinDate}</p>
                                                    <button
                                                        onClick={() => setSelectedMemberDetail(name)}
                                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', background: 'rgba(194, 147, 61, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '2px', cursor: 'pointer' }}
                                                    >ดูพัฒนาการ</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <StatsBox label="คะแนนรวมสัปดาห์นี้" value={s.weeklyTotal} highlight />
                                            <StatsBox label="สถิติการขาด" value={s.absences} danger={s.absences > 0} suffix=" ครั้ง" />
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', gridColumn: 'span 2' }}>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                                                    คะแนนสัปดาห์นี้ (จ-อา)
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                                                    {s.weeklyHits.map((score, i) => (
                                                        <div key={i} style={{ textAlign: 'center' }}>
                                                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'][i]}</p>
                                                            <div style={{
                                                                padding: '4px 2px',
                                                                borderRadius: '2px',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 'bold',
                                                                background: score > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(140, 42, 42, 0.1)',
                                                                color: score > 0 ? '#4ade80' : 'var(--secondary)',
                                                                border: `1px solid ${score > 0 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(140, 42, 42, 0.2)'}`
                                                            }}>
                                                                {score > 0 ? score.toLocaleString() : '-'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Performance Detail Modal */}
                {selectedMemberDetail && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', zIndex: 1100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <div className="glass-panel animate-fade-up" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div>
                                    <h2 className="text-gold" style={{ fontSize: '1.8rem' }}>เส้นทางนักรบ: {selectedMemberDetail}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>บันทึกพัฒนาการพลังทำลายล้าง</p>
                                </div>
                                <button onClick={() => setSelectedMemberDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', height: 'fit-content' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{
                                height: '300px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '12px',
                                borderLeft: '1px solid var(--border)',
                                borderBottom: '1px solid var(--border)',
                                padding: '20px 10px 10px 10px',
                                position: 'relative'
                            }}>
                                {getMemberHistory(selectedMemberDetail).slice(-15).map((h, i, arr) => {
                                    const maxH = Math.max(...arr.map(x => x.score), 1000);
                                    const barHeight = (h.score / maxH) * 100;
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${barHeight}%`,
                                                background: 'linear-gradient(to top, #8c2a2a, #c2933d)',
                                                borderRadius: '2px 2px 0 0',
                                                transition: 'height 0.8s ease-out',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                                                    fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold', whiteSpace: 'nowrap'
                                                }}>
                                                    {h.score > 0 ? h.score.toLocaleString() : ''}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '8px', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                                                {h.date.split('-').slice(1).reverse().join('/')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                    * กราฟแสดงผลคะแนนย้อนหลัง 15 วันล่าสุด เพื่อวิเคราะห์ความสม่ำเสมอและแนวโน้มการเติบโตของพลังฝีมือในแต่ละวันที่พิทักษ์ปราสาท
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryRow({ label, value, icon, danger }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {label}</span>
            <span style={{ fontWeight: 'bold', color: danger ? 'var(--secondary)' : 'inherit' }}>{value}</span>
        </div>
    );
}

function StatsBox({ label, value, highlight, danger, suffix }) {
    return (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: danger ? '1px solid rgba(140, 42, 42, 0.3)' : 'none' }}>
            <p style={{ fontSize: '0.7rem', color: danger ? 'var(--secondary)' : 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: danger ? 'var(--secondary)' : highlight ? 'var(--primary)' : 'inherit' }}>
                {value.toLocaleString()}{suffix}
            </p>
        </div>
    );
}
