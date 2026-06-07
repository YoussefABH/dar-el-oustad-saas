// validators.js

export function validateEmail(email) {

    if (!email) return false;

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return re.test(email);
}

export function validatePayment(amount) {

    const value = Number(amount);

    return !isNaN(value) && value >= 0;
}

export function validateStudentName(name) {

    if (!name) return false;

    return name.trim().length >= 2;
}
