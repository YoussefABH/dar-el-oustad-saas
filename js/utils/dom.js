function showAlert(message, type = 'error') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 4000);
}

function toggleView(view) {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    if (view === 'dashboard') {
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
    } else {
        loginView.style.display = 'block';
        dashboardView.style.display = 'none';
    }
}

function showLoading(containerId, show = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (show) {
        container.innerHTML = '<div class="loader">Chargement...</div>';
    } else {
        container.innerHTML = '';
    }
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
