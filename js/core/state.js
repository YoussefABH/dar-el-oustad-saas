// État global de l'application
let appState = {
    user: null,           // utilisateur Supabase
    profile: null,        // profil (centre_id, role)
    centreId: null,
    role: null,
    config: null
};

export function setAppState(newState) {
    appState = { ...appState, ...newState };
}

export function getAppState() {
    return appState;
}

export function isDirector() {
    return appState.role === 'director';
}
