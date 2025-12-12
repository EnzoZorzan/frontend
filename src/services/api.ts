import axios from "axios";

 export const api = axios.create({
   baseURL: "http://localhost:8081/api",
 });

// export const api = axios.create({
//   baseURL: "https://plataforma-pesquisas.onrender.com/api",
// });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

