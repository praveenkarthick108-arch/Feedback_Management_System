import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const feedbackApi = {
  getAll: (params = {}) => api.get("/feedback", { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  create: (data) => api.post("/feedback", data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
  search: (params = {}) => api.get("/feedback/search", { params }),
};

export const etlApi = {
  upload: (formData) =>
    api.post("/etl/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getRuns: (limit = 20) => api.get("/etl/runs", { params: { limit } }),
  getRunById: (id) => api.get(`/etl/runs/${id}`),
};

export const analyticsApi = {
  getSummary: () => api.get("/analytics/summary"),
  getRatingDist: () => api.get("/analytics/rating-distribution"),
  getTopPrograms: (n = 8) =>
    api.get("/analytics/top-programs", { params: { limit: n } }),
  getTrends: () => api.get("/analytics/trends"),
  getBreakdown: (sortBy = "total_responses") =>
    api.get("/analytics/program-breakdown", { params: { sort_by: sortBy } }),
  download: () => api.get("/analytics/download", { responseType: "blob" }),
};

export default api;
