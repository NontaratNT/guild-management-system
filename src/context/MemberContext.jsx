import { createContext, useContext, useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { activityService } from '../services/activityService';
import { useAuth } from './AuthContext';

const MemberContext = createContext();

export function MemberProvider({ children }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const mockMembers = [
        { id: 1, name: 'Yukisama', role: 'หัวกิล', status: 'มีชีวิต', joinDate: '2024-01-01', notes: 'ผู้นำสูงสุด', castleMiss: 0, warMiss: 0, rebirthMiss: 0, deathDate: null },
        { id: 2, name: 'Valkyrie', role: 'รองกิล', status: 'มีชีวิต', joinDate: '2024-01-15', notes: 'ผู้ดูแลการรบ', castleMiss: 0, warMiss: 0, rebirthMiss: 0, deathDate: null },
        { id: 3, name: 'Arthur', role: 'สมาชิก', status: 'มีชีวิต', joinDate: '2024-02-01', notes: 'แนวหน้า', castleMiss: 1, warMiss: 0, rebirthMiss: 2, deathDate: null },
        { id: 4, name: 'Beowulf', role: 'สมาชิก', status: 'มีชีวิต', joinDate: '2024-02-15', notes: '', castleMiss: 0, warMiss: 3, rebirthMiss: 0, deathDate: null },
        { id: 5, name: 'Merlin', role: 'สมาชิก', status: 'ตายแล้ว', joinDate: '2024-02-20', notes: 'ไปหาลาพิวต้า', castleMiss: 5, warMiss: 5, rebirthMiss: 5, deathDate: '2024-02-28' },
        { id: 6, name: 'Lancelot', role: 'สมาชิก', status: 'ตายแล้ว', joinDate: '2024-02-25', notes: 'หายสาบสูญ', castleMiss: 0, warMiss: 0, rebirthMiss: 0, deathDate: '2024-03-01' }
    ];

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await memberService.getAll();
            if (data && data.length > 1) {
                const formatted = data.slice(1).map((row, idx) => ({
                    id: row[0] || idx,
                    name: row[1],
                    role: row[2],
                    status: row[3],
                    deathDate: row[4] || null, // Assuming column 4 is deathDate or adding it
                    joinDate: row[5] || '2024-01-01',
                    notes: row[6] || '',
                    castleMiss: parseInt(row[7]) || 0,
                    warMiss: parseInt(row[8]) || 0,
                    rebirthMiss: parseInt(row[9]) || 0
                }));
                setMembers(formatted);
                localStorage.setItem('guild_members', JSON.stringify(formatted));
            } else {
                // Try to load from localStorage if service fails or is empty
                const localData = localStorage.getItem('guild_members');
                if (localData) {
                    setMembers(JSON.parse(localData));
                } else {
                    setMembers(mockMembers);
                }
            }
        } catch (error) {
            console.error('Fetch Members Error:', error);
            const localData = localStorage.getItem('guild_members');
            if (localData) {
                setMembers(JSON.parse(localData));
            } else {
                setMembers(mockMembers);
            }
        }
        setLoading(false);
    };

    const { user } = useAuth();

    const addMember = async (memberData) => {
        const newId = Date.now();
        const joinDate = new Date().toISOString().split('T')[0];
        const newMember = { ...memberData, id: newId, joinDate };

        await memberService.create(newMember);
        await activityService.addLog(user?.username, 'จารึกชื่อนักรบใหม่', `ต้อนรับท่าน ${newMember.name} เข้าร่วมกิลด์`);
        const updatedMembers = [...members, newMember];
        setMembers(updatedMembers);
        localStorage.setItem('guild_members', JSON.stringify(updatedMembers));
        return newMember;
    };

    const updateMember = async (id, updatedData) => {
        const oldMember = members.find(m => m.id === id);
        let finalData = { ...updatedData };

        // If status changed to 'ตายแล้ว' and was previously 'มีชีวิต', set deathDate to today
        if (updatedData.status === 'ตายแล้ว' && oldMember && oldMember.status === 'มีชีวิต') {
            finalData.deathDate = new Date().toISOString().split('T')[0];
            await activityService.addLog(user?.username, 'แจ้งนักรบสิ้นชีพ', `${updatedData.name} ได้จากพวกเราไปแล้ว`);
        } else if (updatedData.status === 'มีชีวิต') {
            finalData.deathDate = null;
            if (oldMember?.status === 'ตายแล้ว') {
                await activityService.addLog(user?.username, 'คืนชีพนักรบ', `${updatedData.name} กลับสู่สนามรบอีกครั้ง`);
            }
        }

        await memberService.update(id, finalData);
        if (oldMember?.role !== updatedData.role) {
            await activityService.addLog(user?.username, 'เลื่อนยศ/ตำแหน่ง', `${updatedData.name} ถูกแต่งตั้งเป็น ${updatedData.role}`);
        }

        const updatedMembers = members.map(m => m.id === id ? { ...finalData, id } : m);
        setMembers(updatedMembers);
        localStorage.setItem('guild_members', JSON.stringify(updatedMembers));
    };

    const deleteMember = async (id) => {
        const memberToDelete = members.find(m => m.id === id);
        await memberService.delete(id);
        await activityService.addLog(user?.username, 'ขับไล่นักรบ', `ขับไล่ ${memberToDelete?.name || 'Unknown'} ออกจากกิลด์ถาวร`);
        const updatedMembers = members.filter(m => m.id !== id);
        setMembers(updatedMembers);
        localStorage.setItem('guild_members', JSON.stringify(updatedMembers));
    };

    return (
        <MemberContext.Provider value={{
            members,
            loading,
            fetchMembers,
            addMember,
            updateMember,
            deleteMember
        }}>
            {children}
        </MemberContext.Provider>
    );
}

export const useMembers = () => useContext(MemberContext);

