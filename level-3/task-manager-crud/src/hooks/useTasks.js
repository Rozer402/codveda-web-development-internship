import { useState, useCallback } from 'react';
import { taskService } from '../services/taskService';

/**
 * useTasks Hook
 * Manages states for tasks, loading indicators, errors, and active editing tasks.
 * Exposes handlers for fetching, creating, updating, and deleting tasks.
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  /**
   * Loads tasks from the taskService API.
   */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Adds a new task.
   * Ensures new tasks get a unique local ID to avoid duplicates.
   * @param {string} todoText
   */
  const addTask = async (todoText) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await taskService.createTask(todoText);
      // DummyJSON always returns ID 151 (or standard new ID).
      // If we add multiple tasks, we need to guarantee uniqueness locally.
      const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => Number(t.id))) : 150;
      const uniqueId = Math.max(maxId + 1, 151);

      const taskWithUniqueId = {
        ...newTask,
        id: uniqueId
      };

      setTasks(prevTasks => [taskWithUniqueId, ...prevTasks]);
      return taskWithUniqueId;
    } catch (err) {
      setError(err.message || 'Failed to add task.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates a task by ID.
   * @param {number|string} id
   * @param {Object} updateData
   */
  const updateTask = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await taskService.updateTask(id, updateData);
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === id ? { ...task, ...updated } : task))
      );
      if (editingTask && editingTask.id === id) {
        setEditingTask(null);
      }
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update task.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a task by ID.
   * @param {number|string} id
   */
  const removeTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      if (editingTask && editingTask.id === id) {
        setEditingTask(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    editingTask,
    setEditingTask,
    fetchTasks,
    addTask,
    updateTask,
    removeTask,
  };
}

export default useTasks;
