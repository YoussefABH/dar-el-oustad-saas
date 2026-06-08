import { ApiService } from '../../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>👨‍🏫 Gestion des Enseignants</h2>
            <form id="teacher-form" class="form-row">
                <input type="text" id="t-name" placeholder="Nom complet de l'enseignant" required>
                <input type="text" id="t-subject" placeholder="Discipline / Matière" required>
                <input type="email" id="t-email" placeholder="Adresse email (Optionnel)">
                <button type="submit" id="t-submit" class="btn">Enregistrer</button>
            </form>
        </div>
        <div class="card">
            <h3>Corps Professoral</h3>
            <div id="teachers-list-wrapper"></div>
        </div>
    `;

    const form = container.querySelector('#teacher-form');
    const submitBtn = container.querySelector('#t-submit');

    await refreshList();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const teacherData = {
            full_name: document.getElementById('t-name').value.trim(),
            subject: document.getElementById('t-subject').value.trim(),
            email: document.getElementById('t-email').value.trim() || null
        };

        // Utilisation de withLoading pour bloquer les clics répétitifs (sécurité double écriture)
        await withLoading(submitBtn, async () => {
            await ApiService.createTeacher(teacherData);
            showAlert('Enseignant enregistré avec succès', 'success');
            form.reset();
            await refreshList();
        });
    });
}

async function refreshList() {
    const wrapper = document.getElementById('teachers-list-wrapper');
    if (!wrapper) return;

    try {
        const data = await ApiService.fetchTeachers();

        if (!data || data.length === 0) {
            wrapper.innerHTML = '<p style="color: #64748b; font-style: italic;">Aucun enseignant référencé dans ce centre.</p>';
            return;
        }

        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Enseignant</th><th>Spécialité / Discipline</th><th>Contact Email</th></tr></thead>
                    <tbody>
                        ${data.map(t => `
                            <tr>
                                <td><strong>${escapeHtml(t.full_name)}</strong></td>
                                <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:6px; font-size:0.9rem;">${escapeHtml(t.subject)}</span></td>
                                <td>${escapeHtml(t.email || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        wrapper.innerHTML = '<p style="color:#ef4444;">Échec du chargement des enseignants.</p>';
    }
}
