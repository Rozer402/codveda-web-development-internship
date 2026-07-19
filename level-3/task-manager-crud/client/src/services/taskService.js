import axios from 'axios';

/**
 * taskService.js
 * Service for communicating with Local Backend API for CRUD operations.
 */

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/tasks`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const taskService = {
  /**
   * Fetches tasks from the API.
   * @returns {Promise<Array>} List of tasks
   */
  async getTasks() {
    const response = await axios.get(API_BASE_URL, { headers: getAuthHeaders() });
    return response.data.data; // Unwrapping ApiResponse structure
  },

  /**
   * Creates a new task.
   * @param {string} titleText - The task details text
   * @returns {Promise<Object>} The created task object
   */
  async createTask(titleText) {
    const response = await axios.post(API_BASE_URL, {
      title: titleText,
      completed: false,
    }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  /**
   * Updates an existing task.
   * @param {string} id - Task ID to update
   * @param {Object} updateData - Partial task data to update
   * @returns {Promise<Object>} The updated task object
   */
  async updateTask(id, updateData) {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updateData, { headers: getAuthHeaders() });
    return response.data.data;
  },

  /**
   * Deletes a task.
   * @param {string} id - Task ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteTask(id) {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, { headers: getAuthHeaders() });
    return response.status === 200 || response.data.success;
  }
};

export default taskService;
