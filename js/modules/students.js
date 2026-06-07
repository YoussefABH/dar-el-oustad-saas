import { ApiService } from '../services/api.js';
import { isDirector } from '../core/state.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    const canEdit = isDirector();

    container.innerHTML = `
        <div class="card">
            <h2>👩‍🎓 Gestion des Étudiants</h2>
            ${canEdit ? `
                <form id="student-form" class="form-row">
                    <input type="text" id="s-name" placeholder="Nom complet" required>
                    <input type="text" id="s-level" placeholder="Niveau">
                    <input type="number" id="s-payment" placeholder="Frais (DH)" required>
                    <select id="s-status">
                        <option value="Pending">⏳ En attente</option>
                        <option value="Paid">✅ Réglé</option>
                    </select>
                    <button type="submit" class="btn">Inscrire</button>
                </form>
            ` : '<p class="text-muted">Mode consultation (enseignant).</p>'}
        </div>
        <div class="card">
            <h3>Liste des apprenants</h3>
            <div id="students-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    if (canEdit) {
        const form = container.querySelector('#student-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            await withLoading(submitBtn, async () => {
                await ApiService.createStudent({
                    name: document.getElementById('s-name').value.trim(),
                    level: document.getElementById('s-level').value.trim(),
                    payment_amount: parseFloat(document.getElementById('s-payment').value),
                    status: document.getElementById('s-status').value
                });
                showAlert('Étudiant inscrit', 'success');
                form.reset();
                await refreshList();
            });
        });
    }
}

async function refreshList() {
    const wrapper = document.getElementById('students-list-wrapper');
    if (!wrapper) return;
    try {
        const students = await ApiService.fetchStudents();
        if (!students.length) {
            wrapper.innerHTML = '<p>Aucun étudiant.</p>';
            return;
        }
        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Nom</th><th>Niveau</th><th>Frais</th><th>Statut</th></tr></thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td><strong>${escapeHtml(s.name)}</strong></td>
                                <td>${escapeHtml(s.level || '-')}</td>
                                <td>${s.payment_amount} DH</td>
                                <td><span class="btn btn-sm ${s.status === 'Paid' ? '' : 'btn-danger'}">${s.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        wrapper.innerHTML = `<p class="alert-error">Erreur : ${err.message}</p>`;
    }
}
