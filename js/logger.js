// Logger visuel - affiche les erreurs dans un panneau dans la page
(function() {
    // Créer le conteneur d'erreurs s'il n'existe pas
    if (!document.getElementById('error-panel')) {
        const panel = document.createElement('div');
        panel.id = 'error-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-height: 200px;
            overflow-y: auto;
            display: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(panel);
    }
    
    window.logError = function(msg, details) {
        const panel = document.getElementById('error-panel');
        const errorMsg = document.createElement('div');
        errorMsg.textContent = new Date().toLocaleTimeString() + ' - ' + msg + (details ? ' : ' + JSON.stringify(details) : '');
        panel.appendChild(errorMsg);
        panel.style.display = 'block';
        // Auto-cacher après 10 secondes ?
        setTimeout(() => {
            if (panel.children.length === 0) panel.style.display = 'none';
        }, 10000);
    };
    
    window.clearErrors = function() {
        const panel = document.getElementById('error-panel');
        panel.innerHTML = '';
        panel.style.display = 'none';
    };
    
    // Capturer les erreurs JS globales
    window.addEventListener('error', function(event) {
        logError('JS Error: ' + event.message, { filename: event.filename, line: event.lineno });
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        logError('Promise Rejection: ' + event.reason);
    });
})();
