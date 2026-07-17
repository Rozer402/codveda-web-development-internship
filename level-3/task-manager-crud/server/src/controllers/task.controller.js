const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../errors/ApiResponse');

/**
 * Controller layer for Task management.
 * Handles HTTP requests and responses. Delegates business logic to services.
 */
class TaskController {
  
  // GET /api/v1/tasks
  getTasks = asyncHandler(async (req, res) => {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(new ApiResponse(200, tasks, 'Tasks retrieved successfully'));
  });

  // POST /api/v1/tasks
  createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body);
    res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
  });

  // PUT /api/v1/tasks/:id
  updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'));
  });

  // DELETE /api/v1/tasks/:id
  deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'));
  });
}

module.exports = new TaskController();
