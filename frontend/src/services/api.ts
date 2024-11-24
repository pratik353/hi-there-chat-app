import axios from "axios";

const baseUrl =  "/api/v1/";  
export const socketUrl = "ws://";

export const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`;
export const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const instance = axios.create({
  baseURL: baseUrl,
});

const authInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

authInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.clear();
    window.location.href = "/login";
  }
  return request;
});

authInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status == 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    return Promise.reject(error);
  }
);

export { instance, authInstance };
