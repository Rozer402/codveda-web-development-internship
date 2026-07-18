const Task = require('../models/task.model');
const ApiError = require('../errors/ApiError');

/**
 * Service layer for Task management.
 * Contains pure business logic independent of HTTP requests/responses.
 */
class TaskService {
  /**
   * Get all tasks, sorted by latest first
   * @param {string} userId
   * @returns {Promise<Array>} List of tasks
   */
  async getAllTasks(userId) {
    return await Task.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Create a new task
   * @param {Object} taskData 
   * @param {string} userId
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData, userId) {
    const { title, completed } = taskData;
    
    if (!title) {
      throw new ApiError(400, 'Task title is required');
    }

    const task = new Task({
      title,
      completed: completed || false,
      user: userId
    });

    return await task.save();
  }

  /**
   * Get a task by ID
   * @param {string} id 
   * @param {string} userId
   * @returns {Promise<Object>} Task
   */
  async getTaskById(id, userId) {
    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    return task;
  }

  /**
   * Update a task
   * @param {string} id 
   * @param {Object} updateData 
   * @param {string} userId
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(id, updateData, userId) {
    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
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
   * @param {string} userId
   * @returns {Promise<Object>} Deleted task info
   */
  async deleteTask(id, userId) {
    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    return task;
  }
}

module.exports = new TaskService();
