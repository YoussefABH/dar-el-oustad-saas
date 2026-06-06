export class Header {
    constructor(centerName, userEmail) {
        this.centerName = centerName;
        this.userEmail = userEmail;
    }

    render() {
        const div = document.createElement('div');
        div.className = 'header-content';
        div.innerHTML = `
            <div class="header-title">${this.centerName}</div>
            <div class="header-center-info">${this.userEmail}</div>
            <button id="logout-header-btn" class="btn btn-sm">Déconnexion</button>
        `;
        div.querySelector('#logout-header-btn').onclick = () => window.logout?.();
        return div;
    }
}
