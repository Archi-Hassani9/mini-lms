/**
 * Format a date string to a human-readable format
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a datetime string to a human-readable format with time
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format file size in bytes to human readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Get initials from full name
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Truncate text to maxLength with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Check if a deadline has passed
 * @param {string} deadline - ISO date string
 * @returns {boolean}
 */
export function isDeadlinePast(deadline) {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

/**
 * Get number of days remaining until deadline
 * @param {string} deadline - ISO date string
 * @returns {number} - negative if past
 */
export function getDaysRemaining(deadline) {
  if (!deadline) return 0
  const now = new Date()
  const dl = new Date(deadline)
  const diffMs = dl - now
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Get hours remaining until deadline
 */
export function getHoursRemaining(deadline) {
  if (!deadline) return 0
  const diffMs = new Date(deadline) - new Date()
  return Math.ceil(diffMs / (1000 * 60 * 60))
}

/**
 * Get status badge CSS class
 * @param {string} status
 * @returns {string}
 */
export function getStatusColor(status) {
  const map = {
    Submitted: 'badge-submitted',
    Reviewed: 'badge-reviewed',
    Rejected: 'badge-rejected',
    Active: 'badge-active',
    Inactive: 'badge-inactive',
  }
  return map[status] || 'badge-submitted'
}

/**
 * Validate email address
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase())
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[], strength: number }}
 */
export function validatePassword(password) {
  const errors = []
  let strength = 0

  if (password.length < 8) {
    errors.push('At least 8 characters required')
  } else {
    strength += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter required')
  } else {
    strength += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter required')
  } else {
    strength += 1
  }

  if (!/[0-9]/.test(password)) {
    errors.push('At least one number required')
  } else {
    strength += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('At least one special character required')
  } else {
    strength += 1
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Get password strength label and color
 */
export function getPasswordStrengthInfo(strength) {
  if (strength <= 1) return { label: 'Very Weak', color: '#ef4444', width: '20%' }
  if (strength === 2) return { label: 'Weak', color: '#f59e0b', width: '40%' }
  if (strength === 3) return { label: 'Fair', color: '#f59e0b', width: '60%' }
  if (strength === 4) return { label: 'Good', color: '#10b981', width: '80%' }
  return { label: 'Strong', color: '#10b981', width: '100%' }
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Generate a random gradient based on string (for course thumbnails)
 */
export function stringToGradient(str = '') {
  const gradients = [
    'linear-gradient(135deg, #6366f1, #a855f7)',
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #10b981, #0ea5e9)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #a855f7, #ec4899)',
    'linear-gradient(135deg, #14b8a6, #6366f1)',
  ]
  const index = str.charCodeAt(0) % gradients.length
  return gradients[index]
}
