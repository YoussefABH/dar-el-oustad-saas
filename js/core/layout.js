import { getAppState, onStateChange } from './state.js';
import { navigateTo } from './router.js';
import { Sidebar } from '../components/sidebar.js';
import { Header } from '../components/header.js';
import { escapeHtml } from '../utils/dom.js';

export async function loadLayout() {
    const state = getAppState();
    if (!state.user) return;

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="app-layout">
            <div id="sidebar-container"></div>
            <div class="main-area">
                <div id="header-container"></div>
                <main id="content-container"></main>
            </div>
        </div>
    `;

    // Rendu initial des composants structurels
    const sidebar = new Sidebar(state.role);
    document.getElementById('sidebar-container').appendChild(sidebar.render());

    const header = new Header(state.config?.establishment?.name || 'Dar El-Oustad', state.user.email);
    document.getElementById('header-container').appendChild(header.render());

    attachNavigationEvents();

    // ÉCOUTEUR RÉACTIF : Si le nom du centre change dans les paramètres, le header se met à jour instantanément
    onStateChange((updatedState) => {
        const headerTitle = document.querySelector('header div');
        if (headerTitle && updatedState.config?.establishment?.name) {
            headerTitle.innerHTML = `🏢 ${escapeHtml(updatedState.config.establishment.name)}`;
        }
    });
}

function attachNavigationEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) showView(view);
        });
    });
}

export function showView(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    navigateTo(viewName);
}
