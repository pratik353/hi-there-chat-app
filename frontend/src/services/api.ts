import axios from "axios";

// const baseUrl = "http://192.168.101.5:80/api/v1/";
const baseUrl = "http://localhost:3000/api/v1/";
export const socketUrl = "ws://localhost:3000/";

export const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dzxnhfjsz/auto/upload`


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
    console.log(error, "error in interceptor");
    if (error.response && error.response.status == 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    return Promise.reject(error);
  }
);

export { instance, authInstance };
