// logger.js - Panneau d'erreur visuel
(function() {
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
        let text = new Date().toLocaleTimeString() + ' - ' + msg;
        if (details) text += ' : ' + (typeof details === 'string' ? details : JSON.stringify(details));
        errorMsg.textContent = text;
        panel.appendChild(errorMsg);
        panel.style.display = 'block';
        // Auto-cacher si pas de nouveau message après 10 secondes
        if (window.errorTimeout) clearTimeout(window.errorTimeout);
        window.errorTimeout = setTimeout(() => {
            if (panel.children.length === 0) panel.style.display = 'none';
        }, 10000);
    };
    
    window.clearErrors = function() {
        const panel = document.getElementById('error-panel');
        panel.innerHTML = '';
        panel.style.display = 'none';
    };
    
    // Capture globale des erreurs JS
    window.addEventListener('error', function(event) {
        logError('JS Error: ' + event.message, { filename: event.filename, line: event.lineno });
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        logError('Promise Rejection: ' + event.reason);
    });
})();
