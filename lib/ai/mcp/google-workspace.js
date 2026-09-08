/**
 * google-workspace.js — Google Drive & Google Calendar Integration for Avelia MCP
 * 
 * Menggunakan kredensial Service Account dengan standard JWT Bearer flow (Node.js native).
 * Tanpa dependensi eksternal tambahan.
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:\\Users\\aqana\\AppData\\Local\\hermes\\google-credentials.json';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Mendapatkan access token OAuth2 Google menggunakan Service Account JWT
 */
export async function getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    // Jika token masih valid (dengan buffer 5 menit), gunakan cache
    if (cachedToken && tokenExpiresAt > now + 300) {
        return cachedToken;
    }

    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`File kredensial Google tidak ditemukan di: ${CREDENTIALS_PATH}`);
    }

    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claimSet = Buffer.from(JSON.stringify({
        iss: creds.client_email,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
        aud: creds.token_uri || 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    })).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(header + '.' + claimSet);
    const signature = sign.sign(creds.private_key, 'base64url');
    const jwt = header + '.' + claimSet + '.' + signature;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
        throw new Error(`Gagal autentikasi Google API: ${JSON.stringify(data)}`);
    }

    cachedToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in || 3600);
    return cachedToken;
}

// ==========================================
// GOOGLE CALENDAR
// ==========================================

/**
 * Menampilkan daftar jadwal acara dari Google Calendar
 */
export async function listCalendarEvents(params = {}) {
    const token = await getAccessToken();
    const calendarId = encodeURIComponent(params.calendarId || 'primary');
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`);
    
    if (params.timeMin) url.searchParams.set('timeMin', new Date(params.timeMin).toISOString());
    if (params.timeMax) url.searchParams.set('timeMax', new Date(params.timeMax).toISOString());
    url.searchParams.set('maxResults', String(params.maxResults || 20));
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Google Calendar Error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return (data.items || []).map(event => ({
        id: event.id,
        summary: event.summary || '(Tanpa Judul)',
        description: event.description || '',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location || '',
        status: event.status,
        htmlLink: event.htmlLink
    }));
}

/**
 * Membuat acara baru di Google Calendar
 */
export async function createCalendarEvent(params = {}) {
    const token = await getAccessToken();
    const calendarId = encodeURIComponent(params.calendarId || 'primary');
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

    if (!params.summary) throw new Error('Parameter "summary" (judul acara) wajib diisi.');
    if (!params.start) throw new Error('Parameter "start" (waktu mulai ISO atau tanggal) wajib diisi.');
    if (!params.end) throw new Error('Parameter "end" (waktu selesai ISO atau tanggal) wajib diisi.');

    const isAllDay = !params.start.includes('T');
    const body = {
        summary: params.summary,
        description: params.description || '',
        location: params.location || '',
        start: isAllDay ? { date: params.start } : { dateTime: new Date(params.start).toISOString() },
        end: isAllDay ? { date: params.end } : { dateTime: new Date(params.end).toISOString() }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Google Calendar Error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return {
        id: data.id,
        summary: data.summary,
        start: data.start,
        end: data.end,
        htmlLink: data.htmlLink,
        status: 'created'
    };
}

/**
 * Menghapus acara dari Google Calendar
 */
export async function deleteCalendarEvent(params = {}) {
    const token = await getAccessToken();
    const calendarId = encodeURIComponent(params.calendarId || 'primary');
    if (!params.eventId) throw new Error('Parameter "eventId" wajib diisi.');

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(params.eventId)}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok && res.status !== 204) {
        const data = await res.text();
        throw new Error(`Google Calendar Delete Error [${res.status}]: ${data}`);
    }

    return { eventId: params.eventId, status: 'deleted' };
}

// ==========================================
// GOOGLE DRIVE
// ==========================================

/**
 * Menampilkan daftar file atau folder di Google Drive
 */
export async function listDriveFiles(params = {}) {
    const token = await getAccessToken();
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    
    url.searchParams.set('pageSize', String(params.pageSize || 20));
    url.searchParams.set('fields', 'files(id, name, mimeType, size, modifiedTime, webViewLink, parents)');
    
    let q = 'trashed = false';
    if (params.query) {
        q += ` and (${params.query})`;
    }
    if (params.parentFolderId) {
        q += ` and '${params.parentFolderId}' in parents`;
    }
    url.searchParams.set('q', q);

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Google Drive Error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return data.files || [];
}

/**
 * Membaca isi file teks/dokumen dari Google Drive
 */
export async function readDriveFile(params = {}) {
    const token = await getAccessToken();
    if (!params.fileId) throw new Error('Parameter "fileId" wajib diisi.');

    // Cek metadata file terlebih dahulu
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(params.fileId)}?fields=id,name,mimeType,size`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const meta = await metaRes.json();
    if (!metaRes.ok) {
        throw new Error(`Google Drive Error [${metaRes.status}]: ${JSON.stringify(meta)}`);
    }

    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(params.fileId)}?alt=media`;
    
    // Jika tipe file adalah Google Docs atau Sheets, gunakan export endpoint
    if (meta.mimeType === 'application/vnd.google-apps.document') {
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(params.fileId)}/export?mimeType=text/plain`;
    } else if (meta.mimeType === 'application/vnd.google-apps.spreadsheet') {
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(params.fileId)}/export?mimeType=text/csv`;
    }

    const contentRes = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!contentRes.ok) {
        const errText = await contentRes.text();
        throw new Error(`Gagal mengunduh file [${contentRes.status}]: ${errText}`);
    }

    const textContent = await contentRes.text();
    return {
        id: meta.id,
        name: meta.name,
        mimeType: meta.mimeType,
        content: textContent
    };
}

/**
 * Membuat / Mengunggah file teks baru ke Google Drive
 */
export async function createDriveFile(params = {}) {
    const token = await getAccessToken();
    if (!params.name) throw new Error('Parameter "name" (nama file) wajib diisi.');
    const content = params.content || '';
    const mimeType = params.mimeType || 'text/plain';

    const metadata = {
        name: params.name,
        mimeType: mimeType
    };
    if (params.parentFolderId) {
        metadata.parents = [params.parentFolderId];
    }

    // Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n` +
        content +
        closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Google Drive Upload Error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
        status: 'created'
    };
}
