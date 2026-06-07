import { getAppState } from '../core/state.js';

export class Header {
    constructor(centerName = 'Dar El-Oustad', userEmail = '') {
        this.centerName = centerName;
        this.userEmail = userEmail;
    }

    render() {
        const header = document.createElement('header');
        header.innerHTML = `
            <div style="font-weight: 700; font-size: 1.1rem; color: #0f172a;">
                🏢 ${this.escape(this.centerName)}
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <span style="font-size: 0.9rem; color: #64748b; font-weight: 500;">👤 ${this.escape(this.userEmail)}</span>
                <button id="logout-header-btn" class="btn btn-sm btn-danger">Déconnexion</button>
            </div>
        `;

        header.querySelector('#logout-header-btn').addEventListener('click', async () => {
            const { supabaseClient } = await import('../config/supabase.js');
            await supabaseClient.auth.signOut();
            window.location.reload();
        });

        return header;
    }

    escape(str) {
        return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }
}
