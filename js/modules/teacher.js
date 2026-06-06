// teachers.js - Gestion métier des enseignants (sans compte utilisateur)

async function loadTeachersList() {
    const container = document.getElementById("teachers-list-container");
    if (!container) return;
    container.innerHTML = '<div class="loader">Chargement...</div>';

    const user = await getCurrentUser();
    if (!user) return;

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || !profile.centre_id) {
        container.innerHTML = "<p>Erreur : centre non trouvé</p>";
        return;
    }

    const { data: teachers, error } = await supabaseClient
        .from('teachers')
        .select('*')
        .eq('centre_id', profile.centre_id)
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = "<p>Erreur chargement des enseignants</p>";
        console.error(error);
        return;
    }

    if (teachers.length === 0) {
        container.innerHTML = "<p>Aucun enseignant pour le moment.</p>";
        return;
    }

    container.innerHTML = '';
    teachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'teacher-card';
        card.innerHTML = `
            <div class="teacher-info">
                <strong>${escapeHtml(teacher.full_name)}</strong>
                ${teacher.subject ? `<br>Matière : ${escapeHtml(teacher.subject)}` : ''}
                ${teacher.email ? `<br>Email : ${escapeHtml(teacher.email)}` : ''}
                ${teacher.phone ? `<br>Tél : ${escapeHtml(teacher.phone)}` : ''}
            </div>
            <div class="teacher-actions">
                <button class="edit-teacher-btn" data-id="${teacher.id}" data-name="${escapeHtml(teacher.full_name)}" data-subject="${escapeHtml(teacher.subject || '')}" data-email="${escapeHtml(teacher.email || '')}" data-phone="${escapeHtml(teacher.phone || '')}">Modifier</button>
                <button class="delete-teacher-btn" data-id="${teacher.id}">Supprimer</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Événements suppression
    document.querySelectorAll('.delete-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTeacher(btn.dataset.id));
    });

    // Événements modification (ouvrir modal)
    document.querySelectorAll('.edit-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditTeacherModal(btn.dataset.id, btn.dataset.name, btn.dataset.subject, btn.dataset.email, btn.dataset.phone);
        });
    });
}

async function addTeacher(fullName, subject, email, phone) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non connecté");

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    if (profileError || !profile.centre_id) throw new Error("Centre non trouvé");

    const { error } = await supabaseClient
        .from('teachers')
        .insert({
            centre_id: profile.centre_id,
            full_name: fullName,
            subject: subject,
            email: email,
            phone: phone,
            created_by: user.id
        });

    if (error) throw error;
}

async function updateTeacher(id, fullName, subject, email, phone) {
    const { error } = await supabaseClient
        .from('teachers')
        .update({
            full_name: fullName,
            subject: subject,
            email: email,
            phone: phone
        })
        .eq('id', id);
    if (error) throw error;
}

async function deleteTeacher(id) {
    if (!confirm("Supprimer définitivement cet enseignant ?")) return;
    const { error } = await supabaseClient.from('teachers').delete().eq('id', id);
    if (error) throw error;
}

// Gestion du modal d'édition enseignant
let currentEditTeacherId = null;

function openEditTeacherModal(id, name, subject, email, phone) {
    currentEditTeacherId = id;
    document.getElementById("edit-teacher-id").value = id;
    document.getElementById("edit-teacher-name").value = name;
    document.getElementById("edit-teacher-subject").value = subject;
    document.getElementById("edit-teacher-email").value = email;
    document.getElementById("edit-teacher-phone").value = phone;
    document.getElementById("edit-teacher-modal").style.display = "flex";
}

function closeEditTeacherModal() {
    document.getElementById("edit-teacher-modal").style.display = "none";
    currentEditTeacherId = null;
}

async function saveEditTeacher() {
    const id = document.getElementById("edit-teacher-id").value;
    const name = document.getElementById("edit-teacher-name").value;
    const subject = document.getElementById("edit-teacher-subject").value;
    const email = document.getElementById("edit-teacher-email").value;
    const phone = document.getElementById("edit-teacher-phone").value;

    if (!name.trim()) {
        showAlert("Le nom est requis", "error");
        return;
    }

    try {
        await updateTeacher(id, name, subject, email, phone);
        showAlert("Enseignant modifié", "success");
        closeEditTeacherModal();
        await loadTeachersList();
    } catch (error) {
        showAlert("Erreur : " + error.message, "error");
    }
}

function initTeacherModal() {
    const modal = document.getElementById("edit-teacher-modal");
    const closeBtn = document.querySelector("#edit-teacher-modal .close-modal");
    const saveBtn = document.getElementById("save-edit-teacher-btn");
    if (closeBtn) closeBtn.onclick = closeEditTeacherModal;
    if (saveBtn) saveBtn.onclick = saveEditTeacher;
    window.onclick = (e) => { if (e.target === modal) closeEditTeacherModal(); };
}

// Initialisation du formulaire d'ajout
function initTeacherForm() {
    const addBtn = document.getElementById("add-teacher-btn");
    if (!addBtn) return;
    addBtn.addEventListener("click", async () => {
        const name = document.getElementById("teacher-name").value;
        const subject = document.getElementById("teacher-subject").value;
        const email = document.getElementById("teacher-email").value;
        const phone = document.getElementById("teacher-phone").value;

        if (!name.trim()) {
            showAlert("Le nom de l'enseignant est requis", "error");
            return;
        }

        try {
            await addTeacher(name, subject, email, phone);
            showAlert("Enseignant ajouté", "success");
            document.getElementById("teacher-name").value = "";
            document.getElementById("teacher-subject").value = "";
            document.getElementById("teacher-email").value = "";
            document.getElementById("teacher-phone").value = "";
            await loadTeachersList();
        } catch (error) {
            showAlert("Erreur : " + error.message, "error");
        }
    });
}
