const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('ayurveda_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('ayurveda_token', token);
  } else {
    localStorage.removeItem('ayurveda_token');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { message: 'Unexpected response from server' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ayurveda:auth-expired', {
          detail: { message: data.message || 'Session expired. Please log in again.' }
        }));
      }
    }
    throw new Error(data.message || 'Something went wrong with the request');
  }
  return data;
};

// Real PDF Uploader
export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/pdf`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload PDF document');
  }
  return data;
};

// Real Image & Document Uploader
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload image');
  }
  return data;
};

// API Services
export const authApi = {
  login: (credentials) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  sendOtp: (phone) => apiFetch('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  }),
  verifyOtp: (payload) => apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  registerPatient: (data) => apiFetch('/auth/register-patient', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  registerDoctor: (data) => apiFetch('/auth/register-doctor', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  registerFarmer: (data) => apiFetch('/auth/register-farmer', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMe: () => apiFetch('/auth/me')
};

export const adminApi = {
  getStats: () => apiFetch('/admin/stats'),
  getPendingVerifications: () => apiFetch('/admin/pending-verifications'),
  verifyUser: (userId, action, rejectionReason) => apiFetch('/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ userId, action, rejectionReason })
  }),
  getUsers: (role) => apiFetch(`/admin/users${role ? `?role=${role}` : ''}`),
  getDoctorsRoster: () => apiFetch('/admin/doctors-roster'),
  getFarmersRoster: () => apiFetch('/admin/farmers-roster'),
  getChatsAudit: () => apiFetch('/admin/chats/audit'),
  getPayouts: () => apiFetch('/admin/payouts'),
  settlePayout: (id, payload) => apiFetch(`/admin/payouts/${id}/settle`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getSettings: () => apiFetch('/admin/settings'),
  updateSettings: (payload) => apiFetch('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getOrders: () => apiFetch('/admin/orders'),
  impersonateUser: (userId) => apiFetch(`/admin/impersonate/${userId}`, {
    method: 'POST'
  })
};

export const doctorApi = {
  getDashboardData: () => apiFetch('/doctor/dashboard-data'),
  createPrescription: (payload) => apiFetch('/doctor/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMessages: () => apiFetch('/doctor/messages'),
  sendMessage: (payload) => apiFetch('/doctor/messages', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  requestSettlement: (payload) => apiFetch('/doctor/settlement-request', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  replyReview: (id, replyText) => apiFetch(`/doctor/reviews/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ replyText })
  }),
  replyCommunityPost: (id, replyText) => apiFetch(`/doctor/community/posts/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ replyText })
  }),
  updateProfile: (profileData) => apiFetch('/doctor/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
};

// NOTE: "Farmer" and "Seller" are identical in this platform (farmer hi seller hai).
// farmerApi handles all seller functionality. We also export sellerApi as an alias to avoid confusion.
export const farmerApi = {
  getDashboardData: () => apiFetch('/farmer/dashboard-data'),
  addBatch: (batchData) => apiFetch('/farmer/batches', {
    method: 'POST',
    body: JSON.stringify(batchData)
  }),
  updateBatch: (id, batchData) => apiFetch(`/farmer/batches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(batchData)
  }),
  deleteBatch: (id) => apiFetch(`/farmer/batches/${id}`, {
    method: 'DELETE'
  }),
  restockBatch: (id, addQuantityKg) => apiFetch(`/farmer/batches/${id}/restock`, {
    method: 'PATCH',
    body: JSON.stringify({ addQuantityKg })
  }),
  createCategory: (catData) => apiFetch('/farmer/categories', {
    method: 'POST',
    body: JSON.stringify(catData)
  }),
  updateCategory: (oldName, catData) => apiFetch(`/farmer/categories/${encodeURIComponent(oldName)}`, {
    method: 'PUT',
    body: JSON.stringify(catData)
  }),
  deleteCategory: (name) => apiFetch(`/farmer/categories/${encodeURIComponent(name)}`, {
    method: 'DELETE'
  }),
  requestSettlement: (payload) => apiFetch('/farmer/settlement-request', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  replyReview: (id, replyText) => apiFetch(`/farmer/reviews/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ replyText })
  }),
  updateProfile: (profileData) => apiFetch('/farmer/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
};

// Alias export for Seller
export const sellerApi = farmerApi;

export const supportApi = {
  createTicket: (data) => apiFetch('/support/tickets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getMyTickets: () => apiFetch('/support/tickets/my'),
  getAdminTickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/support/tickets${query ? `?${query}` : ''}`);
  },
  replyTicket: (id, payload) => apiFetch(`/support/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
};

export const patientApi = {
  getDashboardData: () => apiFetch('/patient/dashboard-data'),
  updateProfile: (profileData) => apiFetch('/patient/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  bookConsultation: (bookingData) => apiFetch('/patient/book-consultation', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  logVitals: (vitalsData) => apiFetch('/patient/vitals', {
    method: 'POST',
    body: JSON.stringify(vitalsData)
  }),
  toggleReminder: (reminderId, isTaken) => apiFetch('/patient/toggle-reminder', {
    method: 'POST',
    body: JSON.stringify({ reminderId, isTaken })
  }),
  bookLabTest: (bookingData) => apiFetch('/patient/book-lab-test', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  saveAiAssessment: (assessmentData) => apiFetch('/patient/ai-assessment', {
    method: 'POST',
    body: JSON.stringify(assessmentData)
  }),
  scanPrescription: (payload) => apiFetch('/patient/scan-prescription', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  createOrder: (orderData) => apiFetch('/patient/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  getOrders: () => apiFetch('/patient/orders'),
  uploadSkinPhoto: (photoData) => apiFetch('/patient/skin-photos', {
    method: 'POST',
    body: JSON.stringify(photoData)
  }),
  getSkinPhotos: () => apiFetch('/patient/skin-photos'),
  sendMessage: (msgData) => apiFetch('/patient/messages', {
    method: 'POST',
    body: JSON.stringify(msgData)
  }),
  getMessages: (doctorId) => apiFetch(`/patient/messages/${doctorId}`),
  createReview: (reviewData) => apiFetch('/patient/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
  getCommunityPosts: () => apiFetch('/patient/community/posts'),
  createCommunityPost: (postData) => apiFetch('/patient/community/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  }),
  likeCommunityPost: (id) => apiFetch(`/patient/community/posts/${id}/like`, {
    method: 'POST'
  }),
  enrollProgram: (programData) => apiFetch('/patient/programs/enroll', {
    method: 'POST',
    body: JSON.stringify(programData)
  }),
  getActivePrograms: () => apiFetch('/patient/programs/active')
};

export const publicApi = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/public/products${query ? `?${query}` : ''}`);
  },
  getPrograms: () => apiFetch('/public/programs'),
  getLabTests: () => apiFetch('/public/lab-tests'),
  getVerifiedDoctors: () => apiFetch('/public/verified-doctors'),
  getHerbBatches: () => apiFetch('/public/herb-batches'),
  getBatchByNumber: (batchNumber) => apiFetch(`/public/herb-batches/${batchNumber}`),
  getProductReviews: (productId) => apiFetch(`/public/reviews/${productId}`),
  getArticles: () => apiFetch('/public/articles'),
  getCommunityPosts: () => apiFetch('/public/community'),
  createCommunityPost: (postData) => apiFetch('/public/community/post', {
    method: 'POST',
    body: JSON.stringify(postData)
  }),
  getAiDietPlan: (params) => apiFetch('/public/ai-diet-plan', {
    method: 'POST',
    body: JSON.stringify(params)
  })
};
