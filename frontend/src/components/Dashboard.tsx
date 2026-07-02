import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, AlertCircle, XCircle } from 'lucide-react';
import { apiCall, removeAuthToken } from '../utils/api';
import { TaskList } from './TaskList';

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Form States
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [users, setUsers] = useState<any[]>([]);

  // Fetch users for assignment dropdown (Admin only)
  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      fetchUsers();
    }
  }, [currentUser]);

  // Load task into form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.substring(0, 16) : '');
      setAssignedUserId(editingTask.userId || '');
    } else {
      resetForm();
    }
  }, [editingTask]);

  const fetchUsers = async () => {
    const response = await apiCall('/users');
    if (response.success && response.data) {
      setUsers(response.data);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('PENDING');
    setPriority('MEDIUM');
    setDueDate('');
    setAssignedUserId(currentUser.role === 'ADMIN' ? '' : currentUser.id);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setLoading(true);

    const body: any = {
      title,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    if (currentUser.role === 'ADMIN') {
      body.userId = assignedUserId || undefined;
    }

    let response;
    if (editingTask) {
      response = await apiCall(`/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } else {
      response = await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }

    setLoading(false);

    if (response.success) {
      setFormSuccess(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
      setRefreshTrigger((prev) => prev + 1);
      setEditingTask(null);
      resetForm();
    } else {
      setFormError(response.error?.message || 'Failed to save task.');
    }
  };

  const handleSignOut = () => {
    removeAuthToken();
    onLogout();
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation / Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <span className="app-title">Antigravity Workspace</span>
        </div>
        
        <div className="profile-section">
          <div className="user-info">
            <div className="user-name">
              {currentUser.name}
              <span className={`role-badge role-badge-${currentUser.role.toLowerCase()}`}>
                {currentUser.role}
              </span>
            </div>
            <div className="user-email">{currentUser.email}</div>
          </div>
          
          <button className="btn btn-secondary" onClick={handleSignOut} style={{ width: 'auto', padding: '10px 16px' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Create / Edit Form */}
        <aside className="glass-panel form-panel">
          <div className="panel-title">
            {editingTask ? (
              <>
                <Edit2 size={20} className="text-indigo-400" />
                <h2>Edit Task</h2>
              </>
            ) : (
              <>
                <Plus size={20} className="text-indigo-400" />
                <h2>Create Task</h2>
              </>
            )}
          </div>

          {formError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert alert-success">
              <Plus size={18} />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Task Title</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                style={{ paddingLeft: '12px' }}
                placeholder="Buy groceries, build API..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-input"
                style={{ paddingLeft: '12px', minHeight: '80px', resize: 'vertical' }}
                placeholder="Provide task details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-input form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-input form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="datetime-local"
                className="form-input"
                style={{ paddingLeft: '12px' }}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>

            {currentUser.role === 'ADMIN' && (
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee-select">Assignee</label>
                <select
                  id="task-assignee-select"
                  className="form-input form-select"
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Assign to Yourself</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              {editingTask && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingTask(null)}
                  disabled={loading}
                >
                  <XCircle size={18} />
                  <span>Cancel</span>
                </button>
              )}
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingTask ? (
                  <>
                    <Edit2 size={18} />
                    <span>Update Task</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </aside>

        {/* Right Side: List of Tasks */}
        <main>
          <TaskList
            currentUser={currentUser}
            refreshTrigger={refreshTrigger}
            onEditTask={(task) => setEditingTask(task)}
            onDeleteSuccess={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
