import { ApiService } from '../../services/api.js';
import { getAppState } from '../../core/state.js';
import { escapeHtml, showAlert, withLoading } from '../../utils/dom.js';

export async function render(container) {
    const today = new Date().toISOString().slice(0, 10);

    container.innerHTML = `
        <div class="card">
            <h2>📝 Registre de Présences Numérique</h2>
            <div class="form-row">
                <select id="at-group" required><option value="">-- Charger un groupe --</option></select>
                <input type="date" id="at-date" value="${today}">
                <button id="at-load" class="btn">Ouvrir le classeur</button>
            </div>
        </div>
        <div id="attendance-sheet"></div>
    `;

    try {
        // Chargement initial des groupes pour alimenter le menu déroulant
        const groups = await ApiService.fetchGroups();
        const select = document.getElementById('at-group');
        groups.forEach(g => {
            select.insertAdjacentHTML('beforeend', `<option value="${g.id}">${escapeHtml(g.name)}</option>`);
        });
    } catch (err) {
        showAlert('Impossible de charger les groupes disponibles.', 'error');
    }

    document.getElementById('at-load').onclick = async () => {
        const groupId = document.getElementById('at-group').value;
        const date = document.getElementById('at-date').value;
        if (!groupId) {
            showAlert('Veuillez sélectionner un groupe valide', 'error');
            return;
        }
        await loadAttendanceSheet(groupId, date);
    };
}

async function loadAttendanceSheet(groupId, date) {
    const target = document.getElementById('attendance-sheet');
    target.innerHTML = `
        <div style="display: flex; justify-content: center; padding: 20px;">
            <div class="spinner"></div>
        </div>
    `;

    try {
        const students = await ApiService.fetchStudents();

        if (!students || students.length === 0) {
            target.innerHTML = '<div class="card"><p style="color:#64748b;">Aucun étudiant enregistré dans la base globale de ce centre.</p></div>';
            return;
        }

        target.innerHTML = `
            <div class="card">
                <h3>Émargement de la séance du : ${escapeHtml(date)}</h3>
                <table class="data-table">
                    <thead><tr><th>Étudiant</th><th>Statut de présence</th></tr></thead>
                    <tbody id="attendance-rows">
                        ${students.map(s => `
                            <tr>
                                <td><strong>${escapeHtml(s.name)}</strong></td>
                                <td>
                                    <select data-sid="${s.id}" class="status-selector" style="width: auto;">
                                        <option value="present">✅ Présent</option>
                                        <option value="absent">❌ Absent</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button id="save-attendance" class="btn" style="margin-top:16px;">Sauvegarder et Verrouiller</button>
            </div>
        `;

        const saveBtn = document.getElementById('save-attendance');
        saveBtn.onclick = async () => {
            const state = getAppState();
            const selectors = document.querySelectorAll('.status-selector');
            
            const attendanceRecords = Array.from(selectors).map(sel => ({
                centre_id: state.centreId,
                student_id: sel.dataset.sid,
                group_id: groupId,
                date: date,
                status: sel.value,
                created_by: state.user.id
            }));

            await withLoading(saveBtn, async () => {
                await ApiService.saveAttendance(attendanceRecords);
                showAlert('Feuille de présence enregistrée avec succès', 'success');
            });
        };

    } catch (err) {
        target.innerHTML = `<div class="card alert-error">Échec du chargement du cahier d'appel : ${err.message}</div>`;
    }
}
