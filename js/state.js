const STORAGE_KEY = 'northstar-saved';

function readSaved() {
    try {
        const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return new Set(Array.isArray(ids) ? ids.filter(Number.isInteger) : []);
    } catch {
        return new Set();
    }
}

export const state = {
    day: '',
    tracks: new Set(),
    format: '',
    query: '',
    savedOnly: false,
    saved: readSaved()
};

export function toggleSaved(id) {
    if (state.saved.has(id)) {
        state.saved.delete(id);
    } else {
        state.saved.add(id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.saved]));
}

export function selectSessions(sessions) {
    const query = state.query.toLocaleLowerCase().trim();
    return sessions.filter(session => {
        if (session.day !== state.day) return false;
        if (state.tracks.size && !state.tracks.has(session.track)) return false;
        if (state.format && session.format !== state.format) return false;
        if (state.savedOnly && !state.saved.has(session.id)) return false;
        if (!query) return true;

        const searchable = [
            session.title,
            session.summary,
            ...session.speakers.map(speaker => speaker.name)
        ].join(' ').toLocaleLowerCase();
        return searchable.includes(query);
    });
}
