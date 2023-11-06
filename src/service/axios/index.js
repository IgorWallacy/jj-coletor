
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.86.40:1010",
});

export default api;
