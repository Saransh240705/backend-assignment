import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Calendar, User, CheckCircle, Clock, AlertTriangle, Inbox } from 'lucide-react';
import { apiCall } from '../utils/api';

interface TaskListProps {
  currentUser: any;
  refreshTrigger: number;
  onEditTask: (task: any) => void;
  onDeleteSuccess: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  currentUser,
  refreshTrigger,
  onEditTask,
  onDeleteSuccess,
}) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  // Load tasks on change of filters or refresh trigger
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, statusFilter, priorityFilter, userFilter]);

  // Load system users for dropdown (Admin only)
  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    const queryParams: string[] = [];
    if (statusFilter) queryParams.push(`status=${statusFilter}`);
    if (priorityFilter) queryParams.push(`priority=${priorityFilter}`);
    if (userFilter && currentUser.role === 'ADMIN') queryParams.push(`userId=${userFilter}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const response = await apiCall(`/tasks${queryString}`);

    setLoading(false);
    if (response.success && response.data) {
      setTasks(response.data);
    } else {
      setError(response.error?.message || 'Failed to retrieve tasks.');
    }
  };

  const fetchUsers = async () => {
    const response = await apiCall('/users');
    if (response.success && response.data) {
      setUsers(response.data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    const response = await apiCall(`/tasks/${id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      onDeleteSuccess();
    } else {
      alert(response.error?.message || 'Failed to delete task.');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={14} className="badge-status-icon" />;
      case 'IN_PROGRESS':
        return <Clock size={14} className="badge-status-icon" />;
      default:
        return <AlertTriangle size={14} className="badge-status-icon" />;
    }
  };

  return (
    <div className="glass-panel list-panel">
      <div className="panel-title">
        <Inbox size={20} className="panel-title-icon" />
        <h2>{currentUser.role === 'ADMIN' ? 'All Tasks' : 'My Tasks'}</h2>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-status">Status:</label>
          <select
            id="filter-status"
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-priority">Priority:</label>
          <select
            id="filter-priority"
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-assignee">Assignee:</label>
            <select
              id="filter-assignee"
              className="filter-select"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="empty-state">
          <Clock size={40} className="empty-state-icon animate-pulse" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <Inbox size={40} className="empty-state-icon" />
          <p>No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`glass-panel task-card status-${task.status}`}>
              <div className="task-main">
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-actions">
                    <button
                      className="btn-icon"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  <span className={`badge badge-priority-${task.priority}`}>
                    {task.priority}
                  </span>
                  
                  <span className={`badge`} style={{
                    background: task.status === 'COMPLETED' ? 'var(--bg-completed-glow)' :
                               task.status === 'IN_PROGRESS' ? 'var(--bg-progress-glow)' :
                               'var(--bg-pending-glow)',
                    color: task.status === 'COMPLETED' ? 'var(--color-completed)' :
                           task.status === 'IN_PROGRESS' ? 'var(--color-progress)' :
                           'var(--color-pending)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getStatusIcon(task.status)}
                    {task.status.replace('_', ' ')}
                  </span>
                  
                  <span className="task-date">
                    <Calendar size={12} />
                    <span>{formatDate(task.dueDate)}</span>
                  </span>

                  {currentUser.role === 'ADMIN' && task.user && (
                    <span className="task-assignee">
                      <User size={12} />
                      <span>Assigned to: {task.user.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TaskList;
