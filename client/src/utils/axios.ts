import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Change for production
});

// api/file/repos/analyze

export default instance;
