class AppStateManager extends EventTarget {
    constructor() {
        super();
        this.state = {
            user: null,
            profile: null,
            centreId: null,
            role: null, // 'director' ou 'teacher'
            config: null
        };
    }

    setAppState(newState) {
        this.state = { ...this.state, ...newState };
        // Propagation de l'événement de changement d'état à travers l'application
        this.dispatchEvent(new CustomEvent('statechange', { detail: this.state }));
    }

    getAppState() {
        return this.state;
    }

    isDirector() {
        return this.state.role === 'director';
    }

    onStateChange(callback) {
        this.addEventListener('statechange', (e) => callback(e.detail));
    }
}

const stateManager = new AppStateManager();

export const setAppState = stateManager.setAppState.bind(stateManager);
export const getAppState = stateManager.getAppState.bind(stateManager);
export const isDirector = stateManager.isDirector.bind(stateManager);
export const onStateChange = stateManager.onStateChange.bind(stateManager);

// Rétrocompatibilité console globale si nécessaire
window.appStateInstance = stateManager;
