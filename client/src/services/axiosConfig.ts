import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3030/auth", // Replace with your actual API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
