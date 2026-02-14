import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FiPlus, FiFilter, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TaskBoard = () => {
    const { currentOrg } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('All');
    
    // New Task State
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (currentOrg) fetchTasks();
    }, [currentOrg, filter]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const query = filter !== 'All' ? `?status=${filter}` : '';
            const { data } = await api.get(`/tasks${query}`);
            setTasks(data);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/tasks', newTask);
            toast.success('Task created');
            setShowModal(false);
            setNewTask({ title: '', description: '', priority: 'Medium', status: 'Todo' });
            fetchTasks();
        } catch (error) {
            toast.error('Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Optimistic update
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            toast.success('Status updated');
        } catch (error) {
            toast.error('Update failed');
            fetchTasks(); // Revert
        }
    };

    const handleDelete = async (taskId) => {
        if(!confirm('Are you sure?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t._id !== taskId));
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Delete failed');
        }
    }

    const getPriorityColor = (p) => {
        switch(p) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500">Manage your team's workload</p>
                </div>
                <div className="flex gap-3">
                    <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Todo">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                    <Button onClick={() => setShowModal(true)}>
                        <FiPlus className="mr-2" /> New Task
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map(task => (
                        <div key={task._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(task._id)} className="text-gray-400 hover:text-red-500 text-xs">Delete</button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{task.description || 'No description provided.'}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                        {task.assignee ? task.assignee.name[0] : '?'}
                                    </div>
                                    <span className="text-xs text-gray-500">{task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}</span>
                                </div>
                                <select 
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                    className="text-xs font-medium bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-indigo-500"
                                >
                                    <option value="Todo">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No tasks found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <Input 
                                label="Title" 
                                value={newTask.title} 
                                onChange={e => setNewTask({...newTask, title: e.target.value})}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                    value={newTask.description}
                                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newTask.status}
                                        onChange={e => setNewTask({...newTask, status: e.target.value})}
                                    >
                                        <option>Todo</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" isLoading={submitting}>Create Task</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;