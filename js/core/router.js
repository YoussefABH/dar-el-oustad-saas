// Gestionnaire de routes (modules)
const routes = {
    dashboard: 'js/modules/dashboard/dashboard.js',
    students: 'js/modules/students/students.js',
    teachers: 'js/modules/teachers/teachers.js',
    groups: 'js/modules/groups/groups.js',
    attendance: 'js/modules/attendance/attendance.js',
    payments: 'js/modules/payments/payments.js',
    expenses: 'js/modules/expenses/expenses.js',
    courses: 'js/modules/courses/courses.js',
    reports: 'js/modules/reports/reports.js',
    settings: 'js/modules/settings/settings.js'
};

// Cache des modules chargés
const loadedModules = {};

export async function navigateTo(viewName) {
    if (!routes[viewName]) {
        console.error(`Route inconnue: ${viewName}`);
        return;
    }
    if (!loadedModules[viewName]) {
        await loadModule(viewName);
    }
    if (window[`render${capitalize(viewName)}`]) {
        window[`render${capitalize(viewName)}`]();
    } else {
        console.error(`Fonction render${capitalize(viewName)} non trouvée`);
    }
}

function loadModule(viewName) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = routes[viewName];
        script.onload = () => { loadedModules[viewName] = true; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
