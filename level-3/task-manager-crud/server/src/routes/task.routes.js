const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { validate, createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

// GET /api/v1/tasks
router.get('/', taskController.getTasks);

// POST /api/v1/tasks
router.post('/', validate(createTaskSchema), taskController.createTask);

// PUT /api/v1/tasks/:id
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);

// DELETE /api/v1/tasks/:id
router.delete('/:id', taskController.deleteTask);

module.exports = router;
