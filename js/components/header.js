// Header.js

export class Header {

    constructor(centerName = 'Dar El-Oustad', userEmail = '') {
        this.centerName = centerName;
        this.userEmail = userEmail;
    }

    render() {

        const header = document.createElement('div');

        header.className = 'header-content';

        header.innerHTML = `
            <div class="header-title">
                ${this.centerName}
            </div>

            <div class="header-center-info">
                ${this.userEmail}
            </div>

            <button
                id="logout-header-btn"
                class="btn btn-sm">
                Déconnexion
            </button>
        `;

        const logoutBtn =
            header.querySelector('#logout-header-btn');

        logoutBtn.addEventListener('click', () => {

            if (typeof window.logout === 'function') {
                window.logout();
            }
        });

        return header;
    }
}
