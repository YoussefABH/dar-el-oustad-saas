import { getAppState } from './state.js';
import { navigateTo } from './router.js';
import { Sidebar } from '../components/Sidebar.js';
import { Header } from '../components/Header.js';

let sidebarInitialized = false;
let headerInitialized = false;

export async function loadLayout() {
    const state = getAppState();
    if (!state.user) return;

    // Générer la sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer && !sidebarInitialized) {
        sidebarContainer.innerHTML = '';
        const sidebar = new Sidebar(state.role);
        sidebarContainer.appendChild(sidebar.render());
        sidebarInitialized = true;
    }

    // Générer le header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer && !headerInitialized) {
        const header = new Header(state.config?.establishment?.name || "Dar El-Oustad", state.user.email);
        headerContainer.innerHTML = '';
        headerContainer.appendChild(header.render());
        headerInitialized = true;
    }

    // Attacher les événements de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = item.dataset.view;
            if (view) navigateTo(view);
        });
    });
}

export function showView(viewName) {
    // Mettre à jour l'active dans la sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) item.classList.add('active');
    });
    // Le contenu sera chargé par navigateTo qui appelle render du module
    navigateTo(viewName);
}
