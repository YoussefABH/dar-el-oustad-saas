// Sidebar.js

export class Sidebar {

    constructor(role = 'director') {

        this.role = role;

        this.menus = [
            { view: 'dashboard', label: 'Tableau de bord', icon: '📊', allowed: ['director', 'teacher'] },
            { view: 'students', label: 'Étudiants', icon: '👩‍🎓', allowed: ['director', 'teacher'] },
            { view: 'teachers', label: 'Enseignants', icon: '👨‍🏫', allowed: ['director'] },
            { view: 'groups', label: 'Groupes', icon: '👥', allowed: ['director', 'teacher'] },
            { view: 'attendance', label: 'Présences', icon: '📝', allowed: ['director', 'teacher'] },
            { view: 'payments', label: 'Paiements', icon: '💰', allowed: ['director'] },
            { view: 'expenses', label: 'Dépenses', icon: '📉', allowed: ['director'] },
            { view: 'courses', label: 'Cours', icon: '📚', allowed: ['director', 'teacher'] },
            { view: 'reports', label: 'Rapports', icon: '📈', allowed: ['director'] },
            { view: 'settings', label: 'Paramètres', icon: '⚙️', allowed: ['director'] }
        ];
    }

    render() {

        const nav = document.createElement('nav');
        nav.className = 'sidebar';

        const ul = document.createElement('ul');
        ul.className = 'sidebar-menu';

        const filteredMenus = this.menus.filter(
            menu => menu.allowed.includes(this.role)
        );

        filteredMenus.forEach(menu => {

            const li = document.createElement('li');

            li.className = 'nav-item';
            li.dataset.view = menu.view;

            li.innerHTML = `
                <span class="menu-icon">${menu.icon}</span>
                <span class="menu-label">${menu.label}</span>
            `;

            ul.appendChild(li);
        });

        nav.appendChild(ul);

        return nav;
    }
}
