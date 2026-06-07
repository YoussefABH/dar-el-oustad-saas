let appState = {
    user: null,
    profile: null,
    centreId: null,
    role: null,
    config: null
};

const stateEmitter = new EventTarget();

export function setAppState(newState) {
    appState = { ...appState, ...newState };
    window.appState = appState; // debug
    stateEmitter.dispatchEvent(new CustomEvent('stateChange', { detail: { state: appState } }));
}

export function getAppState() {
    return appState;
}

export function onStateChange(callback) {
    stateEmitter.addEventListener('stateChange', (e) => callback(e.detail.state));
}

export function isDirector() {
    return appState.role === 'director';
}
