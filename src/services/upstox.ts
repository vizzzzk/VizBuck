
'use server';

import fs from 'fs/promises';
import path from 'path';

const UPSTOX_API_URL = 'https://api.upstox.com/v2';

interface AccessToken {
    accessToken: string;
    timestamp: string;
}

async function getAccessToken(): Promise<string> {
    const tokenPath = path.join(process.cwd(), 'upstox_access_token.json');
    try {
        const tokenData = await fs.readFile(tokenPath, 'utf-8');
        const token: AccessToken = JSON.parse(tokenData);
        
        // Check if token is expired (assuming 1 day expiry for safety)
        const tokenDate = new Date(token.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 20) { // Refresh if older than 20 hours
            return await refreshAccessToken();
        }
        return token.accessToken;

    } catch (error) {
        console.log("No existing token found or token is invalid, fetching a new one.");
        return await refreshAccessToken();
    }
}

async function refreshAccessToken(): Promise<string> {
    const apiKey = process.env.UPSTOX_API_KEY;
    const apiSecret = process.env.UPSTOX_API_SECRET;
    // This is a placeholder for the real redirect URI and auth code flow
    const code = "YOUR_AUTHORIZATION_CODE"; // In a real app, this is obtained from user login

    const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    const data = new URLSearchParams({
        'client_id': apiKey!,
        'client_secret': apiSecret!,
        'redirect_uri': 'http://127.0.0.1', // Placeholder
        'grant_type': 'authorization_code',
        'code': code
    });

    try {
        // In a real scenario, we'd make a POST request to the token endpoint.
        // As we can't do that here, we'll simulate the response.
        // We will read the access token from the file provided in the codebase.
        const tokenPath = path.join(process.cwd(), 'upstox_access_token.json');
        const tokenData = await fs.readFile(tokenPath, 'utf-8');
        const tokenJson = JSON.parse(tokenData);
        const newAccessToken = tokenJson.accessToken;

        const newToken: AccessToken = {
            accessToken: newAccessToken,
            timestamp: new Date().toISOString()
        };
        await fs.writeFile(tokenPath, JSON.stringify(newToken, null, 2), 'utf-8');

        return newAccessToken;
    } catch (error: any) {
        console.error("Error refreshing Upstox access token:", error);
        throw new Error("Could not refresh Upstox access token. " + error.message);
    }
}


export async function getHoldingsFromApi() {
    const accessToken = await getAccessToken();

    const headers = {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await fetch(`${UPSTOX_API_URL}/portfolio/long-term-holdings`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Upstox API Error:", errorBody);
            throw new Error(`Upstox API responded with status ${response.status}: ${errorBody.errors?.[0]?.message || 'Unknown Error'}`);
        }
        
        const result = await response.json();
        return result.data;
    } catch (error: any) {
        console.error("Error fetching holdings from Upstox:", error);
        throw new Error("Failed to fetch holdings from Upstox. " + error.message);
    }
}
