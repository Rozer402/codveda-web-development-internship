import React from 'react';

/**
 * TaskCard Component
 * Displays task text, completion checkbox toggle, and triggers for edit/delete functions.
 * @param {Object} props
 * @param {Object} props.task - Task details
 * @param {Function} props.onEdit - Edit trigger callback
 * @param {Function} props.onDelete - Delete trigger callback
 * @param {Function} props.onToggle - Completion state toggle callback
 */
export function TaskCard({ task = {}, onEdit, onDelete, onToggle }) {
  return (
    <div className={`task-card glass-panel ${task.completed ? 'completed' : ''}`}>
      <div className="task-card-content">
        <label className="task-checkbox-wrapper" title={task.completed ? 'Mark as pending' : 'Mark as completed'}>
          <input 
            type="checkbox" 
            checked={!!task.completed} 
            onChange={() => onToggle(task.id, !task.completed)}
            aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
          />
          <span className="task-checkbox-custom"></span>
        </label>
        <h3>{task.title}</h3>
      </div>
      <div className="task-card-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          Edit
        </button>
        <button 
          className="btn btn-danger" 
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
