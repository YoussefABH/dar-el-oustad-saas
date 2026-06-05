// Variable globale pour stocker l'ID en cours d'édition (optionnel)
let currentEditId = null;

async function addStudent() {
    const name = document.getElementById("student-name").value;
    const level = document.getElementById("student-level").value;
    const track = document.getElementById("student-track").value;
    const payment = parseFloat(document.getElementById("student-payment").value);
    const status = document.getElementById("student-status").value;

    if (!validateStudentName(name)) {
        showAlert("Le nom doit contenir au moins 2 caractères", "error");
        return;
    }
    if (isNaN(payment) || payment < 0) {
        showAlert("Montant de paiement invalide", "error");
        return;
    }

    const user = await getCurrentUser();
    if (!user) {
        showAlert("Vous devez être connecté", "error");
        return;
    }

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || !profile.centre_id) {
        showAlert("Centre non trouvé. Reconnectez-vous.", "error");
        return;
    }

    const { error } = await supabaseClient
        .from('students')
        .insert([{
            centre_id: profile.centre_id,
            name: name,
            level: level,
            track: track,
            payment_amount: payment,
            status: status,
            created_by: user.id
        }]);

    if (error) {
        showAlert("Erreur lors de l'ajout : " + error.message, "error");
        return;
    }

    showAlert("Étudiant ajouté", "success");
    document.getElementById("student-name").value = '';
    document.getElementById("student-level").value = '';
    document.getElementById("student-track").value = '';
    document.getElementById("student-payment").value = '';
    document.getElementById("student-status").value = 'Pending';

    await loadDashboardStats();
    await loadStudentsList();
}

async function loadStudentsList() {
    const container = document.getElementById("students-container");
    container.innerHTML = '<div class="loader">Chargement...</div>';

    const user = await getCurrentUser();
    if (!user) return;

    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('centre_id')
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

    container.innerHTML = '';
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="student-info">
                <strong>${escapeHtml(student.name)}</strong><br>
                Niveau: ${escapeHtml(student.level || '-')} | Filière: ${escapeHtml(student.track || '-')}<br>
                Paiement: ${student.payment_amount || 0} DH | Statut: ${student.status}
            </div>
            <div class="student-actions">
                <button class="edit-btn" data-id="${student.id}" data-name="${escapeHtml(student.name)}" data-level="${escapeHtml(student.level || '')}" data-track="${escapeHtml(student.track || '')}" data-payment="${student.payment_amount || 0}" data-status="${student.status}">Modifier</button>
                <button class="delete-btn" data-id="${student.id}">Supprimer</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Événements suppression
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
    });

    // Événements modification (ouvrir modal)
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const level = btn.dataset.level;
            const track = btn.dataset.track;
            const payment = btn.dataset.payment;
            const status = btn.dataset.status;
            openEditModal(id, name, level, track, payment, status);
        });
    });
}

async function deleteStudent(studentId) {
    if (!confirm("Supprimer cet étudiant ?")) return;

    const { error } = await supabaseClient
        .from('students')
        .delete()
        .eq('id', studentId);

    if (error) {
        showAlert("Erreur suppression", "error");
        return;
    }

    showAlert("Étudiant supprimé", "success");
    await loadDashboardStats();
    await loadStudentsList();
}

// Gestion du modal d'édition
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

    if (!validateStudentName(name)) {
        showAlert("Le nom doit contenir au moins 2 caractères", "error");
        return;
    }
    if (isNaN(payment) || payment < 0) {
        showAlert("Montant invalide", "error");
        return;
    }

    const { error } = await supabaseClient
        .from('students')
        .update({
            name: name,
            level: level,
            track: track,
            payment_amount: payment,
            status: status
        })
        .eq('id', id);

    if (error) {
        showAlert("Erreur mise à jour : " + error.message, "error");
        return;
    }

    showAlert("Étudiant modifié", "success");
    closeEditModal();
    await loadDashboardStats();
    await loadStudentsList();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initialisation des événements du modal (à appeler dans app.js)
function initEditModal() {
    const modal = document.getElementById("edit-modal");
    const closeBtn = document.querySelector(".close-modal");
    const saveBtn = document.getElementById("save-edit-btn");

    if (closeBtn) closeBtn.onclick = closeEditModal;
    if (saveBtn) saveBtn.onclick = updateStudent;
    window.onclick = function(event) {
        if (event.target === modal) closeEditModal();
    };
        }
