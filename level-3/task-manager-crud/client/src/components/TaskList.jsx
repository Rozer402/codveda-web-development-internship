import React from 'react';
import TaskCard from './TaskCard';

/**
 * TaskList Component
 * Maps and renders active tasks or displays an empty state placeholder.
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onEdit - Edit select trigger
 * @param {Function} props.onDelete - Delete confirm prompt trigger
 * @param {Function} props.onToggle - Completion checkbox status toggle
 */
export function TaskList({ tasks = [], onEdit, onDelete, onToggle }) {
  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Active Tasks</h2>
        <span className="task-count">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
