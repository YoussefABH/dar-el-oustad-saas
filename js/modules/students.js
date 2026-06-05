let currentEditId = null;

async function addStudent() {
    // ... (identique à avant, mais on vérifie que l'utilisateur est directeur)
    const isDir = await isDirector();
    if (!isDir) {
        showAlert("Seul le directeur peut ajouter des étudiants", "error");
        return;
    }
    // ... reste du code identique
}

async function loadStudentsList() {
    const container = document.getElementById("students-container");
    container.innerHTML = '<div class="loader">Chargement...</div>';

    const user = await getCurrentUser();
    if (!user) return;

    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('centre_id, role')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.centre_id) {
        container.innerHTML = "<p>Erreur centre non trouvé</p>";
        return;
    }

    const { data: students, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', profile.centre_id)
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = "<p>Erreur chargement</p>";
        return;
    }

    if (students.length === 0) {
        container.innerHTML = "<p>Aucun étudiant</p>";
        return;
    }

    const isDirectorUser = profile.role === 'director';

    container.innerHTML = '';
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        let actionsHtml = '';
        if (isDirectorUser) {
            actionsHtml = `
                <div class="student-actions">
                    <button class="edit-btn" data-id="${student.id}" data-name="${escapeHtml(student.name)}" data-level="${escapeHtml(student.level || '')}" data-track="${escapeHtml(student.track || '')}" data-payment="${student.payment_amount || 0}" data-status="${student.status}">Modifier</button>
                    <button class="delete-btn" data-id="${student.id}">Supprimer</button>
                </div>
            `;
        }
        card.innerHTML = `
            <div class="student-info">
                <strong>${escapeHtml(student.name)}</strong><br>
                Niveau: ${escapeHtml(student.level || '-')} | Filière: ${escapeHtml(student.track || '-')}<br>
                Paiement: ${student.payment_amount || 0} DH | Statut: ${student.status}
            </div>
            ${actionsHtml}
        `;
        container.appendChild(card);
    });

    if (isDirectorUser) {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
        });
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditModal(btn.dataset.id, btn.dataset.name, btn.dataset.level, btn.dataset.track, btn.dataset.payment, btn.dataset.status);
            });
        });
    }
}

// deleteStudent, updateStudent, openEditModal, closeEditModal, initEditModal identiques à avant (déjà présents)
// Je les recopie ci-dessous pour que le fichier soit complet.

async function deleteStudent(studentId) {
    if (!confirm("Supprimer cet étudiant ?")) return;
    const { error } = await supabaseClient.from('students').delete().eq('id', studentId);
    if (error) { showAlert("Erreur suppression", "error"); return; }
    showAlert("Étudiant supprimé", "success");
    await loadDashboardStats();
    await loadStudentsList();
}

function openEditModal(id, name, level, track, payment, status) {
    currentEditId = id;
    document.getElementById("edit-student-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-level").value = level;
    document.getElementById("edit-track").value = track;
    document.getElementById("edit-payment").value = payment;
    document.getElementById("edit-status").value = status;
    document.getElementById("edit-modal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("edit-modal").style.display = "none";
    currentEditId = null;
}

async function updateStudent() {
    const id = document.getElementById("edit-student-id").value;
    const name = document.getElementById("edit-name").value;
    const level = document.getElementById("edit-level").value;
    const track = document.getElementById("edit-track").value;
    const payment = parseFloat(document.getElementById("edit-payment").value);
    const status = document.getElementById("edit-status").value;
    if (!validateStudentName(name)) { showAlert("Nom invalide", "error"); return; }
    if (isNaN(payment) || payment < 0) { showAlert("Montant invalide", "error"); return; }
    const { error } = await supabaseClient.from('students').update({ name, level, track, payment_amount: payment, status }).eq('id', id);
    if (error) { showAlert("Erreur mise à jour", "error"); return; }
    showAlert("Étudiant modifié", "success");
    closeEditModal();
    await loadDashboardStats();
    await loadStudentsList();
}

function initEditModal() {
    const modal = document.getElementById("edit-modal");
    const closeBtn = document.querySelector(".close-modal");
    const saveBtn = document.getElementById("save-edit-btn");
    if (closeBtn) closeBtn.onclick = closeEditModal;
    if (saveBtn) saveBtn.onclick = updateStudent;
    window.onclick = function(event) { if (event.target === modal) closeEditModal(); };
}

function escapeHtml(str) { /* identique */ }
