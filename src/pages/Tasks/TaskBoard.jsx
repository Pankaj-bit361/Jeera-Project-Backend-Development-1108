import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { FiPlus, FiFilter, FiZap, FiMoreHorizontal, FiCalendar } from 'react-icons/fi';
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
                const { data } = await api.put(`/tasks/${taskData._id}`, taskData);
                setTasks(tasks.map(t => t._id === taskData._id ? data : t));
                toast.success('Task updated');
                setSelectedTask(data); // Update modal data
            } else {
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
        e.stopPropagation();
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

    const getPriorityBadge = (p) => {
        const styles = {
            High: 'bg-red-50 text-red-600 border-red-100',
            Medium: 'bg-orange-50 text-orange-600 border-orange-100',
            Low: 'bg-green-50 text-green-600 border-green-100'
        };
        return styles[p] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                     <h1 className="text-xl font-bold text-slate-800 px-2">Board</h1>
                     <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                     <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1.5 bg-white text-slate-800 text-sm font-semibold rounded-md shadow-sm">Kanban</button>
                        <button className="px-3 py-1.5 text-slate-500 text-sm font-medium hover:text-slate-700">List</button>
                     </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 hover:bg-slate-100 transition-colors appearance-none cursor-pointer"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Todo">To Do</option>
                            <option value="In Progress">Working</option>
                            <option value="Done">Completed</option>
                        </select>
                    </div>
                    <Button onClick={openCreateModal} className="shadow-orange-500/20">
                        <FiPlus className="mr-2" /> New Task
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                    {tasks.map(task => (
                        <div 
                            key={task._id} 
                            onClick={() => openEditModal(task)}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-[240px]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${getPriorityBadge(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border bg-slate-50 border-slate-200 text-slate-500">
                                        S{task.sprintIndex || 1}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(e, task._id)} 
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                >
                                    <FiMoreHorizontal />
                                </button>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 mb-2 text-lg line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">{task.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">{task.description || 'No description provided.'}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                <div className="flex items-center gap-2">
                                    {task.assignee ? (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm" title={task.assignee.name}>
                                            {getInitials(task.assignee.name)}
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-dashed border-slate-300">
                                            <FiPlus className="text-xs" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold text-orange-600 border border-orange-100" title="Sprint Points">
                                        <FiZap className="text-orange-500" />
                                        <span>{task.sprintPoints || 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                    <FiCalendar />
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'No Date'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add New Card Placeholder */}
                    <div 
                        onClick={openCreateModal}
                        className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer h-[240px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-colors">
                            <FiPlus className="text-xl" />
                        </div>
                        <span className="font-medium">Add New Task</span>
                    </div>
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