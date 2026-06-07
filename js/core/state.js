let appState = {
    user: null,
    profile: null,
    centreId: null,
    role: null,
    config: null
};

export function setAppState(newState) { appState = { ...appState, ...newState }; window.appState = appState; }
export function getAppState() { return appState; }
export function isDirector() { return appState.role === 'director'; }
