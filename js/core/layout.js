// layout.js

import { getAppState } from './state.js';
import { navigateTo } from './router.js';
import { Sidebar } from '../components/Sidebar.js';
import { Header } from '../components/Header.js';

let sidebarInitialized = false;
let headerInitialized = false;

export async function loadLayout() {

    const state = getAppState();

    if (!state.user) return;

    const app = document.getElementById('app');

    if (!app) {
        console.error('Conteneur #app introuvable');
        return;
    }

    // Construire la structure principale
    if (!document.getElementById('sidebar-container')) {

        app.innerHTML = `
            <div class="app-layout">

                <aside id="sidebar-container"></aside>

                <div class="main-area">

                    <header id="header-container"></header>

                    <main id="content-container"></main>

                </div>

            </div>
        `;
    }

    const sidebarContainer =
        document.getElementById('sidebar-container');

    const headerContainer =
        document.getElementById('header-container');

    if (sidebarContainer && !sidebarInitialized) {

        const sidebar =
            new Sidebar(state.role);

        sidebarContainer.innerHTML = '';

        sidebarContainer.appendChild(
            sidebar.render()
        );

        sidebarInitialized = true;
    }

    if (headerContainer && !headerInitialized) {

        const header = new Header(
            state.config?.establishment?.name ||
            'Dar El-Oustad',
            state.user.email
        );

        headerContainer.innerHTML = '';

        headerContainer.appendChild(
            header.render()
        );

        headerInitialized = true;
    }

    attachNavigationEvents();
}

function attachNavigationEvents() {

    document.querySelectorAll('.nav-item')
        .forEach(item => {

            item.addEventListener('click', () => {

                const view =
                    item.dataset.view;

                if (view) {
                    navigateTo(view);
                }
            });
        });
}

export function showView(viewName) {

    document
        .querySelectorAll('.nav-item')
        .forEach(item => {

            item.classList.remove('active');

            if (
                item.dataset.view === viewName
            ) {
                item.classList.add('active');
            }
        });

    navigateTo(viewName);
}
