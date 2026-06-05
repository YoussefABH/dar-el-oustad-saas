function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validatePayment(amount) {
    return !isNaN(amount) && amount >= 0;
}

function validateStudentName(name) {
    return name.trim().length >= 2;
}
