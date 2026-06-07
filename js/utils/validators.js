export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePayment(amount) {
    const val = Number(amount);
    return !isNaN(val) && val >= 0;
}
