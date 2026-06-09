/**
 * Empêche les injections de scripts malveillants (XSS)
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

/**
 * Affiche une notification Toast animée temporaire
 * @param {string} message 
 * @param {string} type - 'success' ou 'error'
 */
export function showAlert(message, type = 'error') {
    // Évite l'accumulation de toasts obsolètes
    const existingToasts = document.querySelectorAll('.alert-toast');
    existingToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `alert-toast alert-${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '✅' : '❌'}</span>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Enveloppe une action asynchrone (soumission de formulaire) pour afficher un état de chargement
 * @param {HTMLButtonElement} buttonElement - Le bouton à désactiver
 * @param {Function} asyncAction - La fonction asynchrone à exécuter
 */
export async function withLoading(buttonElement, asyncAction) {
    if (!buttonElement) return await asyncAction();
    
    const originalHTML = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
            Chargement...
        </span>
    `;
    
    try {
        await asyncAction();
    } catch (error) {
        throw error;
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalHTML;
    }
}

/**
 * Valide le format d'une adresse email
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valide si un montant est numérique et positif
 * @param {number|string} amount 
 * @returns {boolean}
 */
export function validatePayment(amount) {
    const val = Number(amount);
    return !isNaN(val) && val >= 0;
}
