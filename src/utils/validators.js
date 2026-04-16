export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^\+?[\d\s\-()]{7,15}$/.test(phone);
}

export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasMinLength(value, min) {
  return typeof value === 'string' && value.length >= min;
}
