const Task = require('../models/task.model');
const ApiError = require('../errors/ApiError');

/**
 * Service layer for Task management.
 * Contains pure business logic independent of HTTP requests/responses.
 */
class TaskService {
  /**
   * Get all tasks, sorted by latest first
   * @returns {Promise<Array>} List of tasks
   */
  async getAllTasks() {
    return await Task.find().sort({ createdAt: -1 });
  }

  /**
   * Create a new task
   * @param {Object} taskData 
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    const { title, completed } = taskData;
    
    if (!title) {
      throw new ApiError(400, 'Task title is required');
    }

    const task = new Task({
      title,
      completed: completed || false,
    });

    return await task.save();
  }

  /**
   * Get a task by ID
   * @param {string} id 
   * @returns {Promise<Object>} Task
   */
  async getTaskById(id) {
    const task = await Task.findById(id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    return task;
  }

  /**
   * Update a task
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(id, updateData) {
    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Delete a task
   * @param {string} id 
   * @returns {Promise<Object>} Deleted task info
   */
  async deleteTask(id) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    return task;
  }
}

module.exports = new TaskService();
