import { getAppState } from './state.js';
import { navigateTo } from './router.js';
import { Sidebar } from '../components/sidebar.js';
import { Header } from '../components/header.js';

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

    const sidebar = new Sidebar(state.role);
    document.getElementById('sidebar-container').appendChild(sidebar.render());

    const header = new Header(state.config?.establishment?.name || 'Dar El-Oustad', state.user.email);
    document.getElementById('header-container').appendChild(header.render());

    attachNavigationEvents();
    initMobileMenu();
}

function attachNavigationEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) {
                showView(view);
                // Fermer sidebar sur mobile après clic
                if (window.innerWidth <= 768) {
                    document.querySelector('.sidebar')?.classList.remove('open');
                }
            }
        });
    });
}

export function showView(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    navigateTo(viewName);
}

function initMobileMenu() {
    if (window.innerWidth <= 768) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'menu-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.onclick = () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar?.classList.toggle('open');
        };
        const mainArea = document.querySelector('.main-area');
        if (mainArea && !document.querySelector('.menu-toggle')) {
            mainArea.prepend(toggleBtn);
        }
    }
}
