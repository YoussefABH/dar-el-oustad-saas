import { ApiService } from '../services/api.js';
import { getAppState } from '../core/state.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    const today = new Date().toISOString().slice(0, 10);

    container.innerHTML = `
        <div class="card">
            <h2>📋 Feuille de présence</h2>
            <div class="form-row">
                <select id="at-group"><option value="">-- Choisir un groupe --</option></select>
                <input type="date" id="at-date" value="${today}">
                <button id="at-load" class="btn">Ouvrir le registre</button>
            </div>
        </div>
        <div id="attendance-sheet"></div>
    `;

    // Charger les groupes
    const groups = await ApiService.fetchGroups();
    const select = document.getElementById('at-group');
    groups.forEach(g => {
        select.insertAdjacentHTML('beforeend', `<option value="${g.id}">${escapeHtml(g.name)}</option>`);
    });

    document.getElementById('at-load').onclick = async () => {
        const groupId = select.value;
        const date = document.getElementById('at-date').value;
        if (!groupId) return showAlert('Veuillez sélectionner un groupe', 'error');
        await loadAttendanceSheet(groupId, date);
    };
}

async function loadAttendanceSheet(groupId, date) {
    const target = document.getElementById('attendance-sheet');
    const state = getAppState();

    const students = await ApiService.fetchStudents();
    if (!students.length) {
        target.innerHTML = '<div class="card">Aucun étudiant inscrit dans ce centre.</div>';
        return;
    }

    target.innerHTML = `
        <div class="card">
            <h3>Appel du ${date}</h3>
            <table class="data-table">
                <thead><tr><th>Étudiant</th><th>Présence</th></thead>
                <tbody id="attendance-rows">
                    ${students.map(s => `
                        <tr>
                            <td>${escapeHtml(s.name)}</td>
                            <td>
                                <select data-student="${s.id}" class="status-selector">
                                    <option value="present">✅ Présent</option>
                                    <option value="absent">❌ Absent</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button id="save-attendance" class="btn" style="margin-top:16px;">Enregistrer les présences</button>
        </div>
    `;

    document.getElementById('save-attendance').onclick = async () => {
        const selectors = document.querySelectorAll('.status-selector');
        for (let sel of selectors) {
            await ApiService.upsertAttendance({
                student_id: parseInt(sel.dataset.student),
                group_id: groupId,
                date: date,
                status: sel.value
            });
        }
        showAlert('Présences sauvegardées', 'success');
    };
        }
