// Module Attendance – Gestion des présences
export async function renderAttendance(container) {
    const state = window.appState;
    if (!state || !state.centreId) {
        container.innerHTML = '<div class="card">Erreur : centre non trouvé</div>';
        return;
    }

    const isDirector = state.role === 'director';
    const today = new Date().toISOString().slice(0, 10);

    // Interface initiale : sélection du groupe et de la date
    container.innerHTML = `
        <div class="card">
            <h2>📋 Relevé des présences</h2>
            <div class="form-row">
                <select id="attendance-group" style="flex:2;">
                    <option value="">-- Chargement des groupes --</option>
                </select>
                <input type="date" id="attendance-date" value="${today}" style="flex:1;">
                <button id="load-attendance-btn" class="btn">Charger / Enregistrer</button>
            </div>
        </div>
        <div id="attendance-grid-container"></div>
        <div id="attendance-history" class="card" style="display:none;">
            <h3>Historique des présences</h3>
            <div id="history-list"></div>
        </div>
    `;

    // Charger les groupes
    await loadGroupsSelect();

    const loadBtn = document.getElementById('load-attendance-btn');
    loadBtn.onclick = async () => {
        const groupId = document.getElementById('attendance-group').value;
        const date = document.getElementById('attendance-date').value;
        if (!groupId) {
            alert("Veuillez sélectionner un groupe.");
            return;
        }
        await showAttendanceGrid(groupId, date);
    };
}

async function loadGroupsSelect() {
    const state = window.appState;
    const { data: groups, error } = await window.supabaseClient
        .from('groups')
        .select('id, name')
        .eq('centre_id', state.centreId)
        .order('name');
    const select = document.getElementById('attendance-group');
    if (error) {
        select.innerHTML = '<option value="">Erreur chargement groupes</option>';
        return;
    }
    if (groups.length === 0) {
        select.innerHTML = '<option value="">Aucun groupe – créez d’abord des groupes</option>';
        return;
    }
    select.innerHTML = '<option value="">-- Sélectionner un groupe --</option>' + 
        groups.map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');
}

async function showAttendanceGrid(groupId, date) {
    const container = document.getElementById('attendance-grid-container');
    if (!container) return;
    container.innerHTML = '<div class="loader">Chargement des étudiants...</div>';

    const state = window.appState;
    // Récupérer les étudiants du groupe (via la table students, mais il faut une liaison student-groupe)
    // Pour simplifier, on considère que les étudiants sont affectés à un groupe via une colonne `group_id` dans `students`.
    // Si cette colonne n'existe pas, on va l'ajouter.
    // Nous allons d'abord vérifier et ajouter la colonne si nécessaire (migration).
    // Dans l'attente, on suppose qu'il y a une colonne `students.group_id`.
    const { data: students, error } = await window.supabaseClient
        .from('students')
        .select('id, name, level')
        .eq('centre_id', state.centreId)
        .eq('group_id', groupId)
        .order('name');
    if (error) {
        container.innerHTML = `<div class="card error">Erreur chargement étudiants : ${error.message}</div>`;
        return;
    }
    if (students.length === 0) {
        container.innerHTML = '<div class="card">Aucun étudiant dans ce groupe. Veuillez d’abord affecter des étudiants au groupe (modifiez l’étudiant).</div>';
        return;
    }

    // Récupérer les présences existantes pour cette date
    const { data: existing } = await window.supabaseClient
        .from('attendance')
        .select('student_id, status')
        .eq('centre_id', state.centreId)
        .eq('group_id', groupId)
        .eq('date', date);

    const statusMap = {};
    if (existing) {
        existing.forEach(e => { statusMap[e.student_id] = e.status; });
    }

    // Générer le formulaire de présence
    let html = `<div class="card"><h3>Présences du ${new Date(date).toLocaleDateString('fr-FR')}</h3>
        <form id="attendance-form">
            <table class="data-table">
                <thead><tr><th>Étudiant</th><th>Statut</th></tr></thead>
                <tbody>`;
    students.forEach(s => {
        const currentStatus = statusMap[s.id] || 'present';
        html += `
            <tr>
                <td>${escapeHtml(s.name)}</td>
                <td>
                    <select name="status_${s.id}">
                        <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>Présent</option>
                        <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${currentStatus === 'late' ? 'selected' : ''}>En retard</option>
                        <option value="excused" ${currentStatus === 'excused' ? 'selected' : ''}>Excusé</option>
                    </select>
                </td>
            </tr>
        `;
    });
    html += `</tbody></table>
            <div style="margin-top:20px;"><button type="submit" class="btn">Enregistrer les présences</button></div>
        </form>
        <div style="margin-top:15px;"><button id="view-history-btn" class="btn btn-sm">Voir historique du groupe</button></div>
    </div>`;
    container.innerHTML = html;

    // Soumission du formulaire
    document.getElementById('attendance-form').onsubmit = async (e) => {
        e.preventDefault();
        await saveAttendance(groupId, date, students);
    };
    document.getElementById('view-history-btn').onclick = () => showGroupHistory(groupId);
}

async function saveAttendance(groupId, date, students) {
    const state = window.appState;
    const statuses = {};
    for (const s of students) {
        const select = document.querySelector(`select[name="status_${s.id}"]`);
        if (select) statuses[s.id] = select.value;
    }
    // Pour chaque étudiant, on fait un upsert (insert or update)
    for (const s of students) {
        const status = statuses[s.id];
        const { error } = await window.supabaseClient
            .from('attendance')
            .upsert({
                centre_id: state.centreId,
                student_id: s.id,
                group_id: groupId,
                date: date,
                status: status,
                created_by: state.user.id
            }, { onConflict: 'student_id, date' });
        if (error) {
            alert(`Erreur pour ${s.name}: ${error.message}`);
            return;
        }
    }
    alert("Présences enregistrées !");
    // Recharger la grille pour actualiser les statuts
    await showAttendanceGrid(groupId, date);
}

async function showGroupHistory(groupId) {
    const state = window.appState;
    const historyDiv = document.getElementById('attendance-history');
    const listDiv = document.getElementById('history-list');
    historyDiv.style.display = 'block';
    listDiv.innerHTML = '<div class="loader">Chargement...</div>';

    // Récupérer tous les étudiants du groupe
    const { data: students } = await window.supabaseClient
        .from('students')
        .select('id, name')
        .eq('centre_id', state.centreId)
        .eq('group_id', groupId);
    if (!students || students.length === 0) {
        listDiv.innerHTML = '<p>Aucun étudiant dans ce groupe.</p>';
        return;
    }

    // Récupérer toutes les présences des étudiants de ce groupe
    const studentIds = students.map(s => s.id);
    const { data: attendances, error } = await window.supabaseClient
        .from('attendance')
        .select('student_id, date, status')
        .eq('centre_id', state.centreId)
        .eq('group_id', groupId)
        .order('date', { ascending: false });
    if (error) {
        listDiv.innerHTML = `<p>Erreur : ${error.message}</p>`;
        return;
    }
    if (attendances.length === 0) {
        listDiv.innerHTML = '<p>Aucune présence enregistrée pour ce groupe.</p>';
        return;
    }

    // Regrouper par étudiant
    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = { name: s.name, records: [] }; });
    attendances.forEach(a => {
        if (studentMap[a.student_id]) {
            studentMap[a.student_id].records.push({ date: a.date, status: a.status });
        }
    });
    let html = '';
    for (const id in studentMap) {
        const s = studentMap[id];
        html += `<div style="margin-bottom:20px;"><strong>${escapeHtml(s.name)}</strong><ul>`;
        s.records.slice(0, 10).forEach(r => {
            const statusLabel = { present:'✅ Présent', absent:'❌ Absent', late:'⏰ En retard', excused:'📝 Excusé' }[r.status] || r.status;
            html += `<li>${r.date} : ${statusLabel}</li>`;
        });
        if (s.records.length > 10) html += `<li>... et ${s.records.length - 10} autres</li>`;
        html += `</ul></div>`;
    }
    listDiv.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
          }
