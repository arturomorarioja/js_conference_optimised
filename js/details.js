import { getSession } from './api.js';

const dialog = document.querySelector('#details-dialog');
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());

export async function showDetails(id) {
    const session = await getSession(id);
    document.querySelector('#dialog-title').textContent = session.title;
    document.querySelector('#dialog-meta').textContent =
        `${session.day} · ${session.start_time}–${session.end_time} · ${session.room} · ${session.format}`;
    document.querySelector('#dialog-description').textContent = session.description;

    const speakers = document.createDocumentFragment();
    for (const speaker of session.speakers) {
        const person = document.createElement('div');
        person.className = 'dialog-person';
        const photo = document.createElement('img');
        const prefix = `assets/speakers/${speaker.image}`;
        photo.src = `${prefix}-160.webp`;
        photo.srcset = `${prefix}-160.webp 160w, ${prefix}-320.webp 320w`;
        photo.sizes = '4rem';
        photo.width = 160;
        photo.height = 160;
        photo.alt = '';
        photo.loading = 'lazy';

        const description = document.createElement('span');
        const name = document.createElement('strong');
        name.textContent = speaker.name;
        const role = document.createElement('small');
        role.textContent = `${speaker.title} · ${speaker.organisation}`;
        description.append(name, role);
        person.append(photo, description);
        speakers.append(person);
    }
    document.querySelector('#dialog-speakers').replaceChildren(speakers);
    dialog.showModal();
}
