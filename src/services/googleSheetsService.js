/**
 * Google Sheets Service
 * 
 * To use this service:
 * 1. Create a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste the code provided in the instructions.
 * 4. Deploy as a Web App (Set "Who has access" to "Anyone").
 * 5. Copy the Web App URL and paste it here.
 */

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const saveToSheet = async (data) => {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script requests
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Note: with 'no-cors', we can't see the response body, 
        // but the data will reach the script.
        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return { success: false, error };
    }
};

export const getFromSheet = async () => {
    // Reading from sheets requires a GET handler in Apps Script
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return null;
    }
};
