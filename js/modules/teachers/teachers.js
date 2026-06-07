import { ApiService } from '../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>👨‍🏫 Enseignants</h2>
            <form id="teacher-form" class="form-row">
                <input type="text" id="t-name" placeholder="Nom complet" required>
                <input type="text" id="t-subject" placeholder="Matière" required>
                <input type="email" id="t-email" placeholder="Email">
                <button type="submit" class="btn">Ajouter</button>
            </form>
        </div>
        <div class="card">
            <h3>Corps professoral</h3>
            <div id="teachers-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    const form = container.querySelector('#teacher-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        await withLoading(btn, async () => {
            await ApiService.createTeacher({
                full_name: document.getElementById('t-name').value.trim(),
                subject: document.getElementById('t-subject').value.trim(),
                email: document.getElementById('t-email').value.trim() || null
            });
            showAlert('Enseignant ajouté', 'success');
            form.reset();
            await refreshList();
        });
    });
}

async function refreshList() {
    const wrapper = document.getElementById('teachers-list-wrapper');
    try {
        const teachers = await ApiService.fetchTeachers();
        if (!teachers.length) { wrapper.innerHTML = '<p>Aucun enseignant.</p>'; return; }
        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Nom</th><th>Matière</th><th>Email</th></tr></thead>
                    <tbody>
                        ${teachers.map(t => `<tr><td>${escapeHtml(t.full_name)}</td><td>${escapeHtml(t.subject)}</td><td>${escapeHtml(t.email || '-')}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        wrapper.innerHTML = `<p class="alert-error">${err.message}</p>`;
    }
}
