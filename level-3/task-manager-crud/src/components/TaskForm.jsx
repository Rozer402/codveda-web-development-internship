import React, { useState, useEffect } from 'react';

/**
 * TaskForm Component
 * Renders the creation and update workspace form.
 * @param {Object} props
 * @param {Object|null} props.editingTask - The task selected for updates (if any)
 * @param {Function} props.onSaveTask - Function to dispatch new task addition
 * @param {Function} props.onUpdateTask - Function to dispatch task modifications
 * @param {Function} props.onCancelEdit - Function to cancel editing mode
 */
export function TaskForm({ editingTask, onSaveTask, onUpdateTask, onCancelEdit }) {
  const [todoText, setTodoText] = useState('');

  // Populate form input fields when an existing task is selected for editing
  useEffect(() => {
    if (editingTask) {
      setTodoText(editingTask.todo || '');
    } else {
      setTodoText('');
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!todoText.trim()) return;

    if (editingTask) {
      onUpdateTask(editingTask.id, { todo: todoText.trim() });
    } else {
      onSaveTask(todoText.trim());
      setTodoText('');
    }
  };

  return (
    <form className="task-form glass-panel" onSubmit={handleSubmit}>
      <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        {editingTask ? 'Modify the details of your task.' : 'Add a new item to your todo list.'}
      </p>
      
      <div className="form-group">
        <label htmlFor="task-title">Task Description</label>
        <input 
          id="task-title"
          type="text" 
          placeholder="What needs to be done?"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          required
          autoFocus={!!editingTask}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
        {editingTask && (
          <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
