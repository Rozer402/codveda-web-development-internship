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
    setLoading('Loading...');
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Adds a new task.
   * @param {string} titleText
   */
  const addTask = async (titleText) => {
    setLoading('Saving...');
    setError(null);
    try {
      const newTask = await taskService.createTask(titleText);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      return newTask;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
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
    setLoading('Saving...');
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
      setError(err.response?.data?.message || 'Failed to update task.');
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
    setLoading('Deleting...');
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      if (editingTask && editingTask.id === id) {
        setEditingTask(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
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
