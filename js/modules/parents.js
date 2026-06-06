// parents.js - Gestion métier des parents

async function loadParentsList() {
    const container = document.getElementById("parents-list-container");
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
        container.innerHTML = "<p>Erreur centre non trouvé</p>";
        return;
    }

    const { data: parents, error } = await supabaseClient
        .from('parents')
        .select('*')
        .eq('centre_id', profile.centre_id)
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = "<p>Erreur chargement parents</p>";
        console.error(error);
        return;
    }

    if (parents.length === 0) {
        container.innerHTML = "<p>Aucun parent enregistré.</p>";
        return;
    }

    container.innerHTML = '';
    parents.forEach(parent => {
        const card = document.createElement('div');
        card.className = 'parent-card';
        card.innerHTML = `
            <div class="parent-info">
                <strong>${escapeHtml(parent.full_name)}</strong>
                ${parent.email ? `<br>Email : ${escapeHtml(parent.email)}` : ''}
                ${parent.phone ? `<br>Tél : ${escapeHtml(parent.phone)}` : ''}
            </div>
            <div class="parent-actions">
                <button class="edit-parent-btn" data-id="${parent.id}" data-name="${escapeHtml(parent.full_name)}" data-email="${escapeHtml(parent.email || '')}" data-phone="${escapeHtml(parent.phone || '')}">Modifier</button>
                <button class="delete-parent-btn" data-id="${parent.id}">Supprimer</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.delete-parent-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteParent(btn.dataset.id));
    });
    document.querySelectorAll('.edit-parent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEditParentModal(btn.dataset.id, btn.dataset.name, btn.dataset.email, btn.dataset.phone);
        });
    });
}

async function addParent(fullName, email, phone) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non connecté");

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    if (profileError || !profile.centre_id) throw new Error("Centre non trouvé");

    const { error } = await supabaseClient
        .from('parents')
        .insert({
            centre_id: profile.centre_id,
            full_name: fullName,
            email: email,
            phone: phone,
            created_by: user.id
        });
    if (error) throw error;
}

async function updateParent(id, fullName, email, phone) {
    const { error } = await supabaseClient
        .from('parents')
        .update({ full_name: fullName, email: email, phone: phone })
        .eq('id', id);
    if (error) throw error;
}

async function deleteParent(id) {
    if (!confirm("Supprimer définitivement ce parent ?")) return;
    const { error } = await supabaseClient.from('parents').delete().eq('id', id);
    if (error) throw error;
}

// Modal d'édition parent
let currentEditParentId = null;

function openEditParentModal(id, name, email, phone) {
    currentEditParentId = id;
    document.getElementById("edit-parent-id").value = id;
    document.getElementById("edit-parent-name").value = name;
    document.getElementById("edit-parent-email").value = email;
    document.getElementById("edit-parent-phone").value = phone;
    document.getElementById("edit-parent-modal").style.display = "flex";
}

function closeEditParentModal() {
    document.getElementById("edit-parent-modal").style.display = "none";
    currentEditParentId = null;
}

async function saveEditParent() {
    const id = document.getElementById("edit-parent-id").value;
    const name = document.getElementById("edit-parent-name").value;
    const email = document.getElementById("edit-parent-email").value;
    const phone = document.getElementById("edit-parent-phone").value;

    if (!name.trim()) {
        showAlert("Le nom est requis", "error");
        return;
    }

    try {
        await updateParent(id, name, email, phone);
        showAlert("Parent modifié", "success");
        closeEditParentModal();
        await loadParentsList();
    } catch (error) {
        showAlert("Erreur : " + error.message, "error");
    }
}

function initParentModal() {
    const modal = document.getElementById("edit-parent-modal");
    const closeBtn = document.querySelector("#edit-parent-modal .close-modal");
    const saveBtn = document.getElementById("save-edit-parent-btn");
    if (closeBtn) closeBtn.onclick = closeEditParentModal;
    if (saveBtn) saveBtn.onclick = saveEditParent;
    window.onclick = (e) => { if (e.target === modal) closeEditParentModal(); };
}

function initParentForm() {
    const addBtn = document.getElementById("add-parent-btn");
    if (!addBtn) return;
    addBtn.addEventListener("click", async () => {
        const name = document.getElementById("parent-name").value;
        const email = document.getElementById("parent-email").value;
        const phone = document.getElementById("parent-phone").value;

        if (!name.trim()) {
            showAlert("Le nom du parent est requis", "error");
            return;
        }

        try {
            await addParent(name, email, phone);
            showAlert("Parent ajouté", "success");
            document.getElementById("parent-name").value = "";
            document.getElementById("parent-email").value = "";
            document.getElementById("parent-phone").value = "";
            await loadParentsList();
        } catch (error) {
            showAlert("Erreur : " + error.message, "error");
        }
    });
}

// Lier un parent à un étudiant
async function loadParentsForStudent(studentId) {
    const { data: allParents, error } = await supabaseClient
        .from('parents')
        .select('id, full_name');
    if (error) return [];
    // Récupérer les parents déjà liés
    const { data: linked } = await supabaseClient
        .from('student_parents')
        .select('parent_id')
        .eq('student_id', studentId);
    const linkedIds = linked ? linked.map(l => l.parent_id) : [];
    return allParents.map(p => ({ ...p, isLinked: linkedIds.includes(p.id) }));
}

async function linkParentToStudent(parentId, studentId, shouldLink) {
    if (shouldLink) {
        const { error } = await supabaseClient
            .from('student_parents')
            .insert({ student_id: studentId, parent_id: parentId });
        if (error) throw error;
    } else {
        const { error } = await supabaseClient
            .from('student_parents')
            .delete()
            .eq('student_id', studentId)
            .eq('parent_id', parentId);
        if (error) throw error;
    }
}
