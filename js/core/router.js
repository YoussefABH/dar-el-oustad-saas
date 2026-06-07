// router.js

const routes = {
    dashboard: '../modules/dashboard/dashboard.js',
    students: '../modules/students/students.js',
    teachers: '../modules/teachers/teachers.js',
    groups: '../modules/groups/groups.js',
    attendance: '../modules/attendance/attendance.js',
    payments: '../modules/payments/payments.js',
    expenses: '../modules/expenses/expenses.js',
    courses: '../modules/courses/courses.js',
    reports: '../modules/reports/reports.js',
    settings: '../modules/settings/settings.js'
};

const loadedModules = {};

export async function navigateTo(viewName) {

    try {

        if (!routes[viewName]) {
            throw new Error(`Route inconnue : ${viewName}`);
        }

        if (!loadedModules[viewName]) {

            const module = await import(routes[viewName]);

            loadedModules[viewName] = module;
        }

        const module = loadedModules[viewName];

        if (typeof module.render === 'function') {

            await module.render();

        } else {

            console.error(
                `Le module ${viewName} ne contient pas de fonction render()`
            );
        }

    } catch (error) {

        console.error(
            `Erreur chargement module ${viewName}`,
            error
        );

        const container =
            document.getElementById('content-container');

        if (container) {

            container.innerHTML = `
                <div class="card">
                    <h2>Erreur</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}
