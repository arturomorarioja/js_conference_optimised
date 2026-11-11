import { getProgramme } from './api.js';
import { state, selectSessions, toggleSaved } from './state.js';
import { displayFilters, displaySchedule, displayError } from './view.js';

function loadDecorations() {
    // Optional styling changes only hover/decoration; it cannot cause layout shifts.
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'css/extras.css';
    document.head.append(stylesheet);
}

// This request is non-critical; it does not block the initial content.
window.addEventListener('load', loadDecorations, { once: true });

async function initialise() {
    try {
        const { metadata, sessions } = await getProgramme();
        state.day = metadata.days[0];
        const refresh = () => displaySchedule(selectSessions(sessions));

        displayFilters(metadata, refresh);
        refresh();

        document.querySelector('#search-input').addEventListener('input', event => {
            state.query = event.target.value;
            refresh();
        });

        document.querySelector('#saved-filter').addEventListener('click', event => {
            state.savedOnly = !state.savedOnly;
            event.currentTarget.setAttribute('aria-pressed', String(state.savedOnly));
            refresh();
        });

        document.querySelector('#schedule').addEventListener('click', async event => {
            const button = event.target.closest('button');
            const card = button?.closest('.session-card');
            if (!card) return;
            const id = Number(card.dataset.id);

            if (button.classList.contains('save-button')) {
                toggleSaved(id);
                refresh();
            } else if (button.classList.contains('details-button')) {
                try {
                    // Details code and the request it issues are needed only on demand.
                    const { showDetails } = await import('./details.js');
                    await showDetails(id);
                } catch (error) {
                    document.querySelector('#result-count').textContent =
                        `Could not load session details: ${error.message}`;
                }
            }
        });
    } catch (error) {
        displayError(error);
    }
}

initialise();
