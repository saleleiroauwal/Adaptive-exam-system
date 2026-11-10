const API_BASE_URL = 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('adaptive_exam_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If not already on login page, clear token
    if (!endpoint.includes('/auth/login')) {
      localStorage.removeItem('adaptive_exam_token');
      localStorage.removeItem('adaptive_exam_user');
      window.dispatchEvent(new Event('auth_change'));
    }
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'An error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    me: () => request('/auth/me'),
  },

  exams: {
    list: () => request('/exams'),
    get: (id) => request(`/exams/${id}`),
    create: (data) => request('/exams', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    togglePublish: (id) => request(`/exams/${id}/publish`, { method: 'PATCH' }),
    delete: (id) => request(`/exams/${id}`, { method: 'DELETE' }),
  },

  questions: {
    listForExam: (examId) => request(`/exams/${examId}/questions`),
    create: (examId, data) => request(`/exams/${examId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (examId, data) => request(`/exams/${examId}/questions/bulk`, { method: 'POST', body: JSON.stringify(data) }),
    update: (questionId, data) => request(`/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (questionId) => request(`/questions/${questionId}`, { method: 'DELETE' }),
  },

  sessions: {
    start: (examId) => request('/exam-sessions/start', { method: 'POST', body: JSON.stringify({ exam_id: examId }) }),
    getStatus: (sessionId) => request(`/exam-sessions/${sessionId}`),
    submitAnswer: (sessionId, answerData) =>
      request(`/exam-sessions/${sessionId}/submit-answer`, { method: 'POST', body: JSON.stringify(answerData) }),
    finalize: (sessionId) => request(`/exam-sessions/${sessionId}/finalize`, { method: 'POST' }),
  },

  results: {
    getSessionResult: (sessionId) => request(`/results/session/${sessionId}`),
    getMyResults: () => request('/results/student/my-results'),
    getExamResultsForAdmin: (examId) => request(`/results/exam/${examId}/overview`),
  },
};
