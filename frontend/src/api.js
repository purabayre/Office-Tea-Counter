import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const savePriceHistory = (data) =>
  API.post("/price/history", data);

export const fetchPriceHistory = () =>
  API.get("/price/history");

export default API;
