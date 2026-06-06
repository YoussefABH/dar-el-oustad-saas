let currentEditId = null;

async function addStudent() {
    try {
        const isDir = await isDirector();
        if (!isDir) { showAlert("Seul le directeur peut ajouter des étudiants", "error"); return; }
        const name = document.getElementById("student-name").value;
        const level = document.getElementById("student-level").value;
        const track = document.getElementById("student-track").value;
        const payment = parseFloat(document.getElementById("student-payment").value);
        const status = document.getElementById("student-status").value;
        if (!validateStudentName(name)) { showAlert("Le nom doit contenir au moins 2 caractères", "error"); return; }
        if (isNaN(payment) || payment < 0) { showAlert("Montant de paiement invalide", "error"); return; }
        const user = await getCurrentUser();
        if (!user) return;
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('centre_id')
            .eq('id', user.id)
            .single();
        if (profileError) throw profileError;
        if (!profile.centre_id) throw new Error("Centre non trouvé");
        const { error } = await supabaseClient
            .from('students')
            .insert([{
                centre_id: profile.centre_id,
                name, level, track, payment_amount: payment, status, created_by: user.id
            }]);
        if (error) throw error;
        showAlert("Étudiant ajouté", "success");
        document.getElementById("student-name").value = '';
        document.getElementById("student-level").value = '';
        document.getElementById("student-track").value = '';
        document.getElementById("student-payment").value = '';
        document.getElementById("student-status").value = 'Pending';
        await loadDashboardStats();
        await loadStudentsList();
    } catch (e) {
        logError("addStudent error", e.message);
        showAlert("Erreur ajout: " + e.message, "error");
    }
}

async function loadStudentsList() {
    try {
        logError("loadStudentsList début", null);
        const container = document.getElementById("students-container");
        if (!container) return;
        container.innerHTML = '<div class="loader">Chargement...</div>';
        const user = await getCurrentUser();
        if (!user) return;
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('centre_id, role')
            .eq('id', user.id)
            .single();
        if (profileError) throw profileError;
        if (!profile.centre_id) throw new Error("centre_id manquant");
        const { data: students, error } = await supabaseClient
            .from('students')
            .select('*')
            .eq('centre_id', profile.centre_id)
            .order('created_at', { ascending: false });
        if (error) throw error;
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
                        <button class="link-parents-btn" data-id="${student.id}" data-name="${escapeHtml(student.name)}">Lier parents</button>
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
            document.querySelectorAll('.link-parents-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    showLinkParentsModal(btn.dataset.id, btn.dataset.name);
                });
            });
        }
        logError("loadStudentsList terminé", { count: students.length });
    } catch (e) {
        logError("loadStudentsList error", e.message);
        const container = document.getElementById("students-container");
        if (container) container.innerHTML = "<p>Erreur chargement étudiants</p>";
    }
}

async function deleteStudent(studentId) {
    if (!confirm("Supprimer cet étudiant ?")) return;
    try {
        const { error } = await supabaseClient.from('students').delete().eq('id', studentId);
        if (error) throw error;
        showAlert("Étudiant supprimé", "success");
        await loadDashboardStats();
        await loadStudentsList();
    } catch (e) {
        logError("deleteStudent error", e.message);
        showAlert("Erreur suppression: " + e.message, "error");
    }
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
    try {
        const id = document.getElementById("edit-student-id").value;
        const name = document.getElementById("edit-name").value;
        const level = document.getElementById("edit-level").value;
        const track = document.getElementById("edit-track").value;
        const payment = parseFloat(document.getElementById("edit-payment").value);
        const status = document.getElementById("edit-status").value;
        if (!validateStudentName(name)) { showAlert("Nom invalide", "error"); return; }
        if (isNaN(payment) || payment < 0) { showAlert("Montant invalide", "error"); return; }
        const { error } = await supabaseClient
            .from('students')
            .update({ name, level, track, payment_amount: payment, status })
            .eq('id', id);
        if (error) throw error;
        showAlert("Étudiant modifié", "success");
        closeEditModal();
        await loadDashboardStats();
        await loadStudentsList();
    } catch (e) {
        logError("updateStudent error", e.message);
        showAlert("Erreur mise à jour: " + e.message, "error");
    }
}

function initEditModal() {
    const modal = document.getElementById("edit-modal");
    const closeBtn = document.querySelector(".close-modal");
    const saveBtn = document.getElementById("save-edit-btn");
    if (closeBtn) closeBtn.onclick = closeEditModal;
    if (saveBtn) saveBtn.onclick = updateStudent;
    window.onclick = (e) => { if (e.target === modal) closeEditModal(); };
}

async function showLinkParentsModal(studentId, studentName) {
    try {
        const parents = await loadParentsForStudent(studentId);
        if (!parents.length) {
            showAlert("Aucun parent disponible. Veuillez d'abord créer des parents.", "error");
            return;
        }
        const modalDiv = document.getElementById("link-parents-modal");
        if (!modalDiv) return;
        const content = `
            <div class="modal-content" style="max-width:500px;">
                <span class="close-modal" id="close-link-modal">&times;</span>
                <h3>Lier des parents à ${escapeHtml(studentName)}</h3>
                <div id="parents-checkbox-list">
                    ${parents.map(p => `
                        <label style="display:block; margin:8px 0;">
                            <input type="checkbox" value="${p.id}" ${p.isLinked ? 'checked' : ''}>
                            ${escapeHtml(p.full_name)}
                        </label>
                    `).join('')}
                </div>
                <button id="save-parent-links-btn" style="margin-top:15px;">Enregistrer</button>
            </div>
        `;
        modalDiv.innerHTML = content;
        modalDiv.style.display = "flex";
        const closeLinkModal = document.getElementById("close-link-modal");
        if (closeLinkModal) closeLinkModal.onclick = () => modalDiv.style.display = "none";
        const saveBtn = document.getElementById("save-parent-links-btn");
        if (saveBtn) {
            saveBtn.onclick = async () => {
                try {
                    const checkboxes = modalDiv.querySelectorAll('#parents-checkbox-list input[type="checkbox"]');
                    for (let cb of checkboxes) {
                        const parentId = cb.value;
                        const isChecked = cb.checked;
                        const currentlyLinked = parents.find(p => p.id === parentId)?.isLinked || false;
                        if (isChecked !== currentlyLinked) {
                            await linkParentToStudent(parentId, studentId, isChecked);
                        }
                    }
                    showAlert("Liaisons mises à jour", "success");
                    modalDiv.style.display = "none";
                    await loadStudentsList();
                } catch (e) {
                    logError("save parent links error", e.message);
                    showAlert("Erreur: " + e.message, "error");
                }
            };
        }
    } catch (e) {
        logError("showLinkParentsModal error", e.message);
    }
                                  }
