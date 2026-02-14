import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { FiPlus, FiFilter, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import TaskDetailModal from '../../components/Tasks/TaskDetailModal';
import { getInitials } from '../../lib/utils';

const TaskBoard = () => {
    const { currentOrg } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (currentOrg) {
            fetchTasks();
            fetchMembers();
        }
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

    const fetchMembers = async () => {
        try {
            const { data } = await api.get('/organizations/members');
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members");
        }
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (taskData._id) {
                // Update
                const { data } = await api.put(`/tasks/${taskData._id}`, taskData);
                setTasks(tasks.map(t => t._id === taskData._id ? data : t));
                toast.success('Task updated');
                setSelectedTask(data); // Update modal content
            } else {
                // Create
                const { data } = await api.post('/tasks', taskData);
                setTasks([data, ...tasks]);
                toast.success('Task created');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
            throw error;
        }
    };

    const handleDelete = async (e, taskId) => {
        e.stopPropagation(); // Prevent opening modal
        if(!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t._id !== taskId));
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Delete failed');
        }
    }

    const openCreateModal = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const getPriorityColor = (p) => {
        switch(p) {
            case 'High': return 'text-red-700 bg-red-50 border-red-200';
            case 'Medium': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'Low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            default: return 'text-gray-700 bg-gray-50';
        }
    };

    const getStatusColor = (s) => {
        switch(s) {
            case 'Done': return 'bg-indigo-600';
            case 'In Progress': return 'bg-amber-500';
            default: return 'bg-slate-400';
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
                    <p className="text-gray-500">Manage, track, and collaborate on tasks</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <FiFilter className="absolute left-3 top-2.5 text-gray-400" />
                        <select 
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Todo">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <Button onClick={openCreateModal}>
                        <FiPlus className="mr-2" /> New Task
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                    {tasks.map(task => (
                        <div 
                            key={task._id} 
                            onClick={() => openEditModal(task)}
                            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group flex flex-col h-[220px]"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(e, task._id)} 
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                >
                                    Delete
                                </button>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{task.description || 'No description provided.'}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                <div className="flex items-center gap-2">
                                    {task.assignee ? (
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-white" title={task.assignee.name}>
                                            {getInitials(task.assignee.name)}
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border border-dashed border-gray-300">
                                            <FiPlus className="text-xs" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600" title="Sprint Points">
                                        <FiZap className="text-orange-400" />
                                        <span>{task.sprintPoints || 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(task.status)}`}></span>
                                    <span className="text-xs font-medium text-gray-500">{task.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FiPlus className="text-2xl text-gray-400" />
                             </div>
                            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                            <p className="text-gray-500 mb-6">Create a new task to get started with your project.</p>
                            <Button onClick={openCreateModal}>Create First Task</Button>
                        </div>
                    )}
                </div>
            )}

            <TaskDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                members={members}
                onSave={handleSaveTask}
                onUpdate={fetchTasks}
            />
        </div>
    );
};

export default TaskBoard;