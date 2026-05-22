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

export default api;
