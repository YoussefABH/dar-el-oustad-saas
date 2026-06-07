import { getAppState } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    const today = new Date().toISOString().slice(0, 10);

    container.innerHTML = `
        <div class="card">
            <h2>📝 Feuille de Présence Électronique</h2>
            <div class="form-row">
                <select id="at-group"><option value="">-- Sélectionner Groupe --</option></select>
                <input type="date" id="at-date" value="${today}">
                <button id="at-load" class="btn">Ouvrir le registre</button>
            </div>
        </div>
        <div id="attendance-sheet"></div>
    `;

    const { data: groups } = await window.supabaseClient.from('groups').select('id, name').eq('centre_id', state.centreId);
    const select = document.getElementById('at-group');
    if (groups) groups.forEach(g => select.insertAdjacentHTML('beforeend', `<option value="${g.id}">${escapeHtml(g.name)}</option>`));

    document.getElementById('at-load').onclick = async () => {
        const gid = select.value;
        const d = document.getElementById('at-date').value;
        if (!gid) return alert('Sélectionnez un groupe');
        await loadAttendanceSheet(gid, d);
    };
}

async function loadAttendanceSheet(groupId, date) {
    const target = document.getElementById('attendance-sheet');
    const state = getAppState();
    
    const { data: students } = await window.supabaseClient.from('students').select('id, name').eq('centre_id', state.centreId);
    if (!students || !students.length) { target.innerHTML = '<div class="card">Aucun étudiant répertorié.</div>'; return; }

    target.innerHTML = `
        <div class="card">
            <h3>Appel du jour</h3>
            <table class="data-table">
                <thead><tr><th>Nom Émargeant</th><th>Statut</th></tr></thead>
                <tbody id="attendance-rows">
                    ${students.map(s => `
                        <tr>
                            <td>${escapeHtml(s.name)}</td>
                            <td>
                                <select data-sid="${s.id}" class="status-selector">
                                    <option value="present">✅ Présent</option>
                                    <option value="absent">❌ Absent</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button id="save-attendance" class="btn" style="margin-top:16px;">Verrouiller le registre</button>
        </div>
    `;

    document.getElementById('save-attendance').onclick = async () => {
        const rows = document.querySelectorAll('.status-selector');
        for (let sel of rows) {
            await window.supabaseClient.from('attendance').upsert({
                centre_id: state.centreId,
                student_id: sel.dataset.sid,
                group_id: groupId,
                date: date,
                status: sel.value,
                created_by: state.user.id
            });
        }
        showAlert('Registre sauvegardé', 'success');
    };
}
