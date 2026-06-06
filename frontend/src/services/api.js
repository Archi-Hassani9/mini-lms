const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function apiFetch(endpoint, options = {}) {
  let token = localStorage.getItem('access_token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && token) {
      // Try refresh
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('access_token', data.access);
          headers['Authorization'] = `Bearer ${data.access}`;
          // Retry
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }
    }

    // Attempt to parse json
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    }

    if (!response.ok) {
      throw { status: response.status, data };
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const authApi = {
  register: (data) => apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  login: (email, password) => apiFetch('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: (refresh) => apiFetch('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }),
  getProfile: () => apiFetch('/auth/profile/'),
  updateProfile: (data) => apiFetch('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
};

export const courseApi = {
  getAll: (params = '') => apiFetch(`/courses/${params}`),
  getById: (id) => apiFetch(`/courses/${id}/`),
  create: (data) => apiFetch('/courses/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/courses/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/courses/${id}/`, { method: 'DELETE' }),
};

export const lessonApi = {
  getByCourse: (courseId) => apiFetch(`/courses/${courseId}/lessons/`),
  getById: (id) => apiFetch(`/lessons/${id}/`),
  create: (courseId, data) => apiFetch(`/courses/${courseId}/lessons/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/lessons/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/lessons/${id}/`, { method: 'DELETE' }),
};

export const enrollmentApi = {
  enroll: (courseId) => apiFetch('/enrollments/enroll/', { method: 'POST', body: JSON.stringify({ course: courseId }) }),
  getMyEnrollments: () => apiFetch('/enrollments/my/'),
  getAll: (params = '') => apiFetch(`/enrollments/${params}`),
  updateProgress: (courseId, percentage) => apiFetch(`/progress/${courseId}/`, { method: 'PUT', body: JSON.stringify({ percentage }) }),
};

export const assignmentApi = {
  getByCourse: (courseId) => apiFetch(`/courses/${courseId}/assignments/`),
  getById: (id) => apiFetch(`/assignments/${id}/`),
  create: (courseId, data) => apiFetch(`/courses/${courseId}/assignments/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/assignments/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/assignments/${id}/`, { method: 'DELETE' }),
  getSubmissions: (assignmentId) => apiFetch(`/assignments/${assignmentId}/all-submissions/`),
};

export const submissionApi = {
  submit: (assignmentId, formData) => apiFetch(`/assignments/${assignmentId}/submissions/`, { method: 'POST', body: formData }),
  getMySubmissions: () => apiFetch('/submissions/my/'),
  getById: (id) => apiFetch(`/submissions/${id}/`),
  updateStatus: (id, status) => apiFetch(`/submissions/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const analyticsApi = {
  getAdminStats: () => apiFetch('/analytics/admin/'),
  getStudentStats: () => apiFetch('/analytics/student/'),
};
