async function addStudent() {
    const name = document.getElementById("student-name").value;
    const level = document.getElementById("student-level").value;
    const track = document.getElementById("student-track").value;
    const payment = parseFloat(document.getElementById("student-payment").value);
    const status = document.getElementById("student-status").value;

    if (!name || name.length < 2) {
        alert("Nom invalide");
        return;
    }
    if (isNaN(payment) || payment < 0) {
        alert("Montant invalide");
        return;
    }

    // Récupérer l'utilisateur
    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !user) {
        alert("Non connecté");
        return;
    }

    // Récupérer centre_id
    const { data: profile, error: profErr } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    if (profErr || !profile || !profile.centre_id) {
        alert("Centre non trouvé. Reconnectez-vous ou contactez l'admin.");
        console.error(profErr);
        return;
    }

    const { error } = await supabaseClient
        .from('students')
        .insert({
            centre_id: profile.centre_id,
            name: name,
            level: level,
            track: track,
            payment_amount: payment,
            status: status,
            created_by: user.id
        });

    if (error) {
        alert("Erreur ajout: " + error.message);
        console.error(error);
        return;
    }

    alert("Étudiant ajouté");
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
    if (!container) return;
    container.innerHTML = "Chargement...";
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('centre_id, role')
        .eq('id', user.id)
        .single();
    if (!profile || !profile.centre_id) {
        container.innerHTML = "Erreur centre";
        return;
    }
    const { data: students, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', profile.centre_id)
        .order('created_at', { ascending: false });
    if (error) {
        container.innerHTML = "Erreur chargement";
        return;
    }
    if (students.length === 0) {
        container.innerHTML = "Aucun étudiant";
        return;
    }
    const isDirector = (profile.role === 'director');
    container.innerHTML = '';
    students.forEach(s => {
        const div = document.createElement('div');
        div.className = 'student-card';
        div.innerHTML = `
            <strong>${escapeHtml(s.name)}</strong><br>
            Niveau: ${escapeHtml(s.level || '-')} | Filière: ${escapeHtml(s.track || '-')}<br>
            Paiement: ${s.payment_amount || 0} DH | Statut: ${s.status}
            ${isDirector ? `<br><button class="edit-btn" data-id="${s.id}" data-name="${escapeHtml(s.name)}" data-level="${escapeHtml(s.level||'')}" data-track="${escapeHtml(s.track||'')}" data-payment="${s.payment_amount||0}" data-status="${s.status}">Modifier</button>
            <button class="delete-btn" data-id="${s.id}">Supprimer</button>` : ''}
        `;
        container.appendChild(div);
    });
    if (isDirector) {
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

async function deleteStudent(id) {
    if (!confirm("Supprimer ?")) return;
    const { error } = await supabaseClient.from('students').delete().eq('id', id);
    if (error) alert("Erreur");
    else { alert("Supprimé"); await loadDashboardStats(); await loadStudentsList(); }
}

function openEditModal(id, name, level, track, payment, status) {
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
}

async function updateStudent() {
    const id = document.getElementById("edit-student-id").value;
    const name = document.getElementById("edit-name").value;
    const level = document.getElementById("edit-level").value;
    const track = document.getElementById("edit-track").value;
    const payment = parseFloat(document.getElementById("edit-payment").value);
    const status = document.getElementById("edit-status").value;
    if (!name || name.length < 2) { alert("Nom invalide"); return; }
    if (isNaN(payment)) { alert("Montant invalide"); return; }
    const { error } = await supabaseClient
        .from('students')
        .update({ name, level, track, payment_amount: payment, status })
        .eq('id', id);
    if (error) alert("Erreur mise à jour");
    else { alert("Modifié"); closeEditModal(); await loadDashboardStats(); await loadStudentsList(); }
}

function initEditModal() {
    const modal = document.getElementById("edit-modal");
    const closeBtn = document.querySelector(".close-modal");
    const saveBtn = document.getElementById("save-edit-btn");
    if (closeBtn) closeBtn.onclick = closeEditModal;
    if (saveBtn) saveBtn.onclick = updateStudent;
    window.onclick = (e) => { if (e.target === modal) closeEditModal(); };
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
