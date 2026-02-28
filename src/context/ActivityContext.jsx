
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { activityService } from '../services/activityService';
import { useMembers } from './MemberContext';
import { useAuth } from './AuthContext';

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
    const { members } = useMembers();
    const [warData, setWarData] = useState({});
    const [warSummaries, setWarSummaries] = useState([]);
    const [castleData, setCastleData] = useState({});
    const [rebirthData, setRebirthData] = useState({});
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [recentLogs, setRecentLogs] = useState([]);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        const [war, summaries, castle, rebirth] = await Promise.all([
            activityService.getWarData(),
            activityService.getWarSummaries(),
            activityService.getCastleData(),
            activityService.getRebirthData()
        ]);

        if (war) setWarData(war);
        if (summaries) setWarSummaries(summaries);
        if (castle) setCastleData(castle);
        if (rebirth) setRebirthData(rebirth);

        setRecentLogs(activityService.getRecentLogs());
        setLoading(false);
    };

    const updateWarData = async (newData) => {
        setWarData(newData);
        activityService.saveWarData(newData);
        await activityService.addLog(user?.username, 'บันทึกศึกกิลด์วอร์', `อัปเดตข้อมูลการรบ`);
        setRecentLogs(activityService.getRecentLogs());
    };

    const updateWarSummaries = async (newData) => {
        setWarSummaries(newData);
        activityService.saveWarSummaries(newData);
    };

    const updateCastleData = async (newData) => {
        setCastleData(newData);
        activityService.saveCastleData(newData);
        await activityService.addLog(user?.username, 'บันทึกบอสปราสาท', `อัปเดตคะแนนตีปราสาท`);
        setRecentLogs(activityService.getRecentLogs());
    };

    const updateRebirthData = async (newData) => {
        setRebirthData(newData);
        activityService.saveRebirthData(newData);
        await activityService.addLog(user?.username, 'บันทึกบอสจุติ', `อัปเดตคะแนนบอสจุติ`);
        setRecentLogs(activityService.getRecentLogs());
    };

    const computedMemberStats = useMemo(() => {
        const statsMap = {};
        const activities = { warData, castleData, rebirthData };

        members.forEach(m => {
            statsMap[m.name] = activityService.calculateMemberStats(m.name, members, activities);
        });

        return statsMap;
    }, [members, warData, castleData, rebirthData]);

    return (
        <ActivityContext.Provider value={{
            warData,
            warSummaries,
            castleData,
            rebirthData,
            updateWarData,
            updateWarSummaries,
            updateCastleData,
            updateRebirthData,
            computedMemberStats,
            recentLogs,
            loading,
            refreshData: loadAllData
        }}>
            {children}
        </ActivityContext.Provider>
    );
}

export const useActivities = () => useContext(ActivityContext);
