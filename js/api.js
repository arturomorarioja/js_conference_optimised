const API_URL = 'http://localhost:19437/api';

async function getJson(path) {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
    }
    return response.json();
}

export async function getProgramme() {
    const [metadata, result] = await Promise.all([
        getJson('/meta'),
        getJson('/sessions')
    ]);
    return { metadata, sessions: result.sessions };
}

export function getSession(id) {
    return getJson(`/sessions/${encodeURIComponent(id)}`);
}
