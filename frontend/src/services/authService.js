import axios from "axios";

const API_URL = "http://localhost:8080/api"; // Backend base URL

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data; // Return the backend response
  } catch (error) {
    throw error.response ? error.response.data : "Network error";
  }
};
