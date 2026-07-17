import axios from 'axios';

/**
 * taskService.js
 * Service for communicating with DummyJSON Todos API for CRUD operations.
 * API Endpoints:
 * - GET (Read):     https://dummyjson.com/todos
 * - POST (Create):  https://dummyjson.com/todos/add
 * - PUT (Update):   https://dummyjson.com/todos/{id}
 * - DELETE (Delete):https://dummyjson.com/todos/{id}
 */

const API_BASE_URL = 'https://dummyjson.com/todos';

export const taskService = {
  /**
   * Fetches tasks from the DummyJSON API.
   * @returns {Promise<Array>} List of tasks
   */
  async getTasks() {
    const response = await axios.get(`${API_BASE_URL}?limit=15`); // limit to 15 for better workspace usability
    return response.data.todos;
  },

  /**
   * Creates a new task.
   * @param {string} todoText - The task details text
   * @returns {Promise<Object>} The created task object
   */
  async createTask(todoText) {
    const response = await axios.post(`${API_BASE_URL}/add`, {
      todo: todoText,
      completed: false,
      userId: 1, // DummyJSON requirement
    });
    return response.data;
  },

  /**
   * Updates an existing task.
   * Handles local tasks bypass (id > 150) to avoid 404 errors.
   * @param {number|string} id - Task ID to update
   * @param {Object} updateData - Partial task data to update
   * @returns {Promise<Object>} The updated task object
   */
  async updateTask(id, updateData) {
    // If the ID is a locally created task (DummyJSON returns IDs from 151 onwards),
    // we bypass the server network request as it will return 404
    if (Number(id) > 150) {
      return {
        id: Number(id),
        ...updateData,
      };
    }

    const response = await axios.put(`${API_BASE_URL}/${id}`, updateData);
    return response.data;
  },

  /**
   * Deletes a task.
   * Handles local tasks bypass (id > 150) to avoid 404 errors.
   * @param {number|string} id - Task ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteTask(id) {
    if (Number(id) > 150) {
      return true;
    }

    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.status === 200 || response.data.isDeleted;
  }
};

export default taskService;
