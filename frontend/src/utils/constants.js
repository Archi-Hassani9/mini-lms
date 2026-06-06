export const ROLES = {
  ADMIN: 'Admin',
  STUDENT: 'Student',
}

export const SUBMISSION_STATUS = {
  SUBMITTED: 'Submitted',
  REVIEWED: 'Reviewed',
  REJECTED: 'Rejected',
}

export const CATEGORIES = [
  'Web Development',
  'Data Science',
  'UI/UX Design',
  'Python Programming',
  'Digital Marketing',
  'Other',
]

export const ALLOWED_FILE_TYPES = ['.pdf', '.docx', '.pptx', '.zip']
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
]

export const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200 MB

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Mini LMS'

export const CATEGORY_COLORS = {
  'Web Development': '#6366f1',
  'Data Science': '#0ea5e9',
  'UI/UX Design': '#a855f7',
  'Python Programming': '#10b981',
  'Digital Marketing': '#f59e0b',
  Other: '#94a3b8',
}
