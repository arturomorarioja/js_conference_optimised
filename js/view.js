import { state } from './state.js';

const cardTemplate = document.querySelector('#session-card-template');
const schedule = document.querySelector('#schedule');

export function displayFilters(metadata, onChange) {
    const trackList = document.querySelector('#track-list');
    const tracks = document.createDocumentFragment();

    for (const track of metadata.tracks) {
        const item = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        const name = document.createTextNode(` ${track.name}`);
        checkbox.type = 'checkbox';
        checkbox.value = track.slug;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) state.tracks.add(track.slug);
            else state.tracks.delete(track.slug);
            onChange();
        });
        label.className = 'track-option';
        label.append(checkbox, name);
        item.append(label);
        tracks.append(item);
    }
    trackList.replaceChildren(tracks);

    const formatSelect = document.querySelector('#format-filter');
    const formats = document.createDocumentFragment();
    for (const format of metadata.formats) {
        const option = document.createElement('option');
        option.value = format;
        option.textContent = format;
        formats.append(option);
    }
    formatSelect.append(formats);
    formatSelect.addEventListener('change', () => {
        state.format = formatSelect.value;
        onChange();
    });

    const dayList = document.querySelector('#day-list');
    const days = document.createDocumentFragment();
    for (const day of metadata.days) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.day = day;
        button.textContent = formatDay(day);
        button.addEventListener('click', () => {
            state.day = day;
            updateDays();
            onChange();
        });
        item.append(button);
        days.append(item);
    }
    dayList.replaceChildren(days);
    updateDays();
}

function formatDay(day) {
    return new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short'
    });
}

function updateDays() {
    for (const button of document.querySelectorAll('#day-list button')) {
        button.setAttribute('aria-pressed', String(button.dataset.day === state.day));
    }
}

function createCard(session) {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    const speaker = session.speakers[0];

    card.dataset.id = String(session.id);
    card.querySelector('.track-tag').textContent = session.track_name;
    card.querySelector('.format-tag').textContent = session.format;
    card.querySelector('h3').textContent = session.title;
    card.querySelector('.session-summary').textContent = session.summary;
    card.querySelector('.speaker-name').textContent = speaker.name;
    card.querySelector('.room').textContent = `${session.room} · ${session.start_time}`;

    const portrait = card.querySelector('.speaker-photo');
    const prefix = `assets/speakers/${speaker.image}`;
    portrait.src = `${prefix}-160.webp`;
    portrait.srcset = `${prefix}-160.webp 160w, ${prefix}-320.webp 320w`;
    portrait.sizes = '3rem';

    const saveButton = card.querySelector('.save-button');
    const isSaved = state.saved.has(session.id);
    saveButton.setAttribute('aria-pressed', String(isSaved));
    saveButton.textContent = isSaved ? '★ Saved' : '☆ Save';
    return card;
}

export function displaySchedule(sessions) {
    const fragment = document.createDocumentFragment();
    const count = sessions.length;
    let currentTime = null;
    let currentList = null;

    for (const session of sessions) {
        if (session.start_time !== currentTime) {
            currentTime = session.start_time;
            const group = document.createElement('div');
            group.className = 'time-group';
            const time = document.createElement('time');
            time.className = 'time-marker';
            time.dateTime = session.start_time;
            time.textContent = session.start_time;
            currentList = document.createElement('div');
            currentList.className = 'session-list';
            group.append(time, currentList);
            fragment.append(group);
        }
        currentList.append(createCard(session));
    }

    if (count === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No sessions match your filters.';
        fragment.append(empty);
    }

    schedule.replaceChildren(fragment);
    document.querySelector('#day-heading').textContent = formatDay(state.day);
    document.querySelector('#result-count').textContent = `${count} sessions`;
    document.querySelector('#saved-count').textContent = String(state.saved.size);
}

export function displayError(error) {
    document.querySelector('#day-heading').textContent = 'Unable to load the programme';
    document.querySelector('#schedule').textContent =
        `Start the API on http://localhost:19437 and reload. ${error.message}`;
}
