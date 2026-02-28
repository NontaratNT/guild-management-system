/**
 * Google Sheets Service for Guild Members CRUD
 * 
 * To use this service:
 * 1. Create a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Use the Apps Script code provides in the instructions.
 * 4. Deploy as Web App (Access: Anyone).
 */

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const memberService = {
    // CREATE
    create: async (member) => {
        return await sendRequest({ action: 'createMember', sheetName: 'Members', ...member });
    },

    // READ
    getAll: async () => {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=read&sheetName=Members`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    },

    // UPDATE
    update: async (id, updatedData) => {
        return await sendRequest({ action: 'updateMember', sheetName: 'Members', id, ...updatedData });
    },

    // DELETE
    delete: async (id) => {
        return await sendRequest({ action: 'deleteMember', sheetName: 'Members', id });
    }
};

async function sendRequest(data) {
    try {
        // Note: Google Apps Script POST requests often need redirect handling or no-cors
        // But for full CRUD with response, a proxy or specifically configured GAS is better.
        // Using no-cors means we can't see the response, but the data arrives.
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return { success: true };
    } catch (error) {
        console.error('Service Error:', error);
        return { success: false, error };
    }
}
