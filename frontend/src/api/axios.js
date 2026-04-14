import axios from "axios";

const request = axios.create({
  baseURL: "/api",
  timeout: 60000
});

request.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message = error?.response?.data?.message || error.message || "请求失败";
    return Promise.reject(new Error(message));
  }
);

export default request;
