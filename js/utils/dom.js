// utils.js

export function showAlert(message, type = 'error') {

    const existingAlert =
        document.querySelector('.alert');

    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv =
        document.createElement('div');

    alertDiv.className =
        `alert alert-${type}`;

    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

export function showLoading(containerId, show = true) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    if (show) {

        container.innerHTML = `
            <div class="loader">
                Chargement...
            </div>
        `;

    } else {

        container.innerHTML = '';
    }
}

export function escapeHtml(str = '') {

    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
