import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Footer from '../components/Footer';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import useTasks from '../hooks/useTasks';

/**
 * Home Page Component
 * Serves as the dashboard workspace coordinating task data, layouts, and modals.
 */
export function Home() {
  const {
    tasks,
    loading,
    error,
    editingTask,
    setEditingTask,
    fetchTasks,
    addTask,
    updateTask,
    removeTask,
  } = useTasks();

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch tasks when the page loads
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await removeTask(deleteTargetId);
      } catch (err) {
        // Error state handled inside useTasks hook
      } finally {
        setIsConfirmOpen(false);
        setDeleteTargetId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await updateTask(id, { completed });
    } catch (err) {
      // Error state handled inside useTasks hook
    }
  };

  const handleSaveNewTask = async (text) => {
    try {
      await addTask(text);
    } catch (err) {
      // Error state handled inside useTasks hook
    }
  };

  const handleUpdateTaskText = async (id, data) => {
    try {
      await updateTask(id, data);
    } catch (err) {
      // Error state handled inside useTasks hook
    }
  };

  return (
    <div className="home-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="container" style={{ flex: 1 }}>
        {error && <ErrorMessage message={error} />}
        
        <section className="dashboard-grid">
          <TaskForm 
            editingTask={editingTask}
            onSaveTask={handleSaveNewTask}
            onUpdateTask={handleUpdateTaskText}
            onCancelEdit={() => setEditingTask(null)}
          />
          
          <div className="list-wrapper" style={{ position: 'relative' }}>
            {loading && <div style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>{loading}</div>}
            <TaskList 
              tasks={tasks}
              onEdit={setEditingTask}
              onDelete={handleDeleteClick}
              onToggle={handleToggleComplete}
            />
          </div>
        </section>
      </main>
      <Footer />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default Home;
