export function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

export function showAlert(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert-toast alert-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

export async function withLoading(button, callback) {
    const originalText = button.textContent;
    const originalDisabled = button.disabled;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-small"></span> Chargement...';
    try {
        await callback();
    } finally {
        button.disabled = originalDisabled;
        button.textContent = originalText;
    }
}
