import { ref } from 'vue';
import validator from 'validator';

export function useValidation() {
    const errors = ref({}); // make it ref to be reactive, so that UI updates on changes

    const validateRequired = (fieldName, value) => {
        if (validator.isEmpty(value || '')) {
            errors.value[fieldName] = `${fieldName} is required`
        } else {
            delete errors.value[fieldName]
        }
    }

    const validateEmail = (email) => {
        if (validator.isEmpty(email || '')) {
        errors.value.email = 'Email is required'
        } else if (!validator.isEmail(email)) {
        errors.value.email = 'Invalid email format'
        } else {
        delete errors.value.email
        }
    }

    const validatePassword = (password) => {
        const messages = []

        if (validator.isEmpty(password || '')) {
            errors.value.password = 'Password is required'
            return
        }

        if (password.length < 8) messages.push('At least 8 characters')
        if (!/[a-z]/.test(password)) messages.push('At least one lowercase letter')
        if (!/[A-Z]/.test(password)) messages.push('At least one uppercase letter')
        if (!/[0-9]/.test(password)) messages.push('At least one number')
        if (!/[^A-Za-z0-9]/.test(password)) messages.push('At least one special character')

        if (messages.length > 0) {
            errors.value.password = `Password must contain: ${messages.join(', ')}`
        } else {
            delete errors.value.password
        }
    }

    const validateConfirmPassword = (password, confirmPassword) => {
        if (validator.isEmpty(confirmPassword || '')) {
            errors.value.confirmPassword = 'Please confirm your password'
        } else if (password !== confirmPassword) {
            errors.value.confirmPassword = 'Passwords do not match'
        } else {
            delete errors.value.confirmPassword
        }
    }

    const clearErrors = () => {
        errors.value = {}
    }

    return {
        errors,
        validateRequired,
        validateEmail,
        validatePassword,
        validateConfirmPassword,
        clearErrors
    }
}
