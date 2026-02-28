
const STORAGE_KEYS = {
    WAR: 'warData',
    CASTLE: 'castleData',
    REBIRTH: 'rebirthData',
    WAR_SUMMARIES: 'warSummaries',
    LOGS: 'logs'
};

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const activityService = {
    addLog: async (userName, action, detail) => {
        const logEntry = {
            timestamp: new Date().toLocaleString('th-TH'),
            user: userName || 'Unknown',
            action,
            detail
        };

        const localLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
        localLogs.unshift(logEntry);
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(localLogs.slice(0, 50)));

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'log',
                    sheetName: 'Logs',
                    payload: logEntry
                })
            });
        } catch (e) { console.error('Log Error:', e); }

        return logEntry;
    },

    getRecentLogs: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]'),

    // Remote Fetch Helper
    fetchSheetData: async (sheetName) => {
        try {
            // ใช้ fetch แบบเรียบง่ายที่สุด (Simple Request) 
            // ไม่ต้องใส่ headers หรือ options ซับซ้อน เพื่อเลี่ยงปัญหา CORS กับ 302 Redirect
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=read&sheetName=${sheetName}`);

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (data && data.length > 0 && data[0][0]) {
                try {
                    return JSON.parse(data[0][0]);
                } catch (e) {
                    console.error(`Error parsing JSON from ${sheetName}:`, e);
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error(`Fetch error for ${sheetName}:`, error);
            return null;
        }
    },

    // Remote Save Helper
    saveSheetData: async (sheetName, payload) => {
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'saveActivity',
                    sheetName,
                    payload
                })
            });
            return true;
        } catch (error) {
            console.error(`Save error for ${sheetName}:`, error);
            return false;
        }
    },

    // Guild War
    getWarData: async () => {
        const remote = await activityService.fetchSheetData('WarData');
        if (remote) localStorage.setItem(STORAGE_KEYS.WAR, JSON.stringify(remote));
        return remote || JSON.parse(localStorage.getItem(STORAGE_KEYS.WAR) || '{}');
    },
    saveWarData: async (data) => {
        localStorage.setItem(STORAGE_KEYS.WAR, JSON.stringify(data));
        return await activityService.saveSheetData('WarData', data);
    },

    getWarSummaries: async () => {
        const remote = await activityService.fetchSheetData('WarSummaries');
        if (remote) localStorage.setItem(STORAGE_KEYS.WAR_SUMMARIES, JSON.stringify(remote));
        return remote || JSON.parse(localStorage.getItem(STORAGE_KEYS.WAR_SUMMARIES) || '[]');
    },
    saveWarSummaries: async (data) => {
        localStorage.setItem(STORAGE_KEYS.WAR_SUMMARIES, JSON.stringify(data));
        return await activityService.saveSheetData('WarSummaries', data);
    },

    // Castle Boss
    getCastleData: async () => {
        const remote = await activityService.fetchSheetData('CastleData');
        if (remote) localStorage.setItem(STORAGE_KEYS.CASTLE, JSON.stringify(remote));
        return remote || JSON.parse(localStorage.getItem(STORAGE_KEYS.CASTLE) || '{}');
    },
    saveCastleData: async (data) => {
        localStorage.setItem(STORAGE_KEYS.CASTLE, JSON.stringify(data));
        return await activityService.saveSheetData('CastleData', data);
    },

    // Rebirth Boss
    getRebirthData: async () => {
        const remote = await activityService.fetchSheetData('RebirthData');
        if (remote) localStorage.setItem(STORAGE_KEYS.REBIRTH, JSON.stringify(remote));
        return remote || JSON.parse(localStorage.getItem(STORAGE_KEYS.REBIRTH) || '{}');
    },
    saveRebirthData: async (data) => {
        localStorage.setItem(STORAGE_KEYS.REBIRTH, JSON.stringify(data));
        return await activityService.saveSheetData('RebirthData', data);
    },

    // Global Statistics Calculation
    calculateMemberStats: (memberName, members, activities) => {
        const { warData, castleData, rebirthData } = activities;
        const member = members.find(m => m.name === memberName);
        if (!member) return null;

        const joinDate = new Date(member.joinDate);
        const deathDate = member.deathDate ? new Date(member.deathDate) : null;

        let stats = {
            totalBossScore: 0,
            totalWarWins: 0,
            totalWarAttacks: 0,
            rebirthHits: 0,
            castleHits: 0,
            castleMiss: 0,
            warMiss: 0,
            rebirthMiss: 0
        };

        // Helper to check if a date is within active range
        const isActiveAt = (date) => {
            const d = new Date(date);
            return d >= joinDate && (!deathDate || d <= deathDate);
        };

        // Castle Calculation
        Object.entries(castleData).forEach(([dateStr, dayRecords]) => {
            if (isActiveAt(dateStr)) {
                const record = dayRecords.find(r => r.member === memberName);
                if (record && record.score > 0) {
                    stats.totalBossScore += record.score;
                    stats.castleHits += 1;
                } else {
                    stats.castleMiss += 1;
                }
            }
        });

        // War Calculation
        Object.values(warData).forEach(season => {
            Object.entries(season).forEach(([dateStr, records]) => {
                if (isActiveAt(dateStr)) {
                    const record = records.find(r => r.name === memberName);
                    if (record && record.attacksUsed > 0) {
                        stats.totalWarWins += record.wins;
                        stats.totalWarAttacks += record.attacksUsed;
                    } else {
                        stats.warMiss += 1;
                    }
                }
            });
        });

        // Rebirth Calculation
        const allRebirthDates = new Set();
        Object.values(rebirthData).forEach(season => {
            season.forEach(r => { if (r.date) allRebirthDates.add(r.date); });
        });

        allRebirthDates.forEach(dateStr => {
            if (isActiveAt(dateStr)) {
                let recorded = false;
                Object.values(rebirthData).forEach(season => {
                    season.forEach(r => {
                        if (r.member === memberName && r.date === dateStr) {
                            stats.totalBossScore += r.score;
                            stats.rebirthHits += r.count;
                            recorded = true;
                        }
                    });
                });
                if (!recorded) stats.rebirthMiss += 1;
            }
        });

        const winRate = stats.totalWarAttacks > 0 ? Math.round((stats.totalWarWins / (stats.totalWarAttacks * 1.5)) * 100) : 0;

        return { ...stats, winRate };
    }
};
