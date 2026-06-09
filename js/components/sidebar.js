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
            { view: 'parents', label: 'Parents', icon: '👪', allowed: ['director'] },
            { view: 'center', label: 'Mon Centre', icon: '🏢', allowed: ['director'] },
            { view: 'settings', label: 'Paramètres', icon: '⚙️', allowed: ['director'] }
        ];
    }

    render() {
        const aside = document.createElement('aside');
        aside.className = 'sidebar';
        aside.innerHTML = `
            <div class="sidebar-brand">Dar El-Oustad Pro</div>
            <ul class="sidebar-menu"></ul>
        `;
        
        const menuList = aside.querySelector('.sidebar-menu');
        this.menus.filter(m => m.allowed.includes(this.role)).forEach(menu => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.dataset.view = menu.view;
            li.innerHTML = `<span>${menu.icon}</span> <span>${menu.label}</span>`;
            menuList.appendChild(li);
        });
        return aside;
    }
}
