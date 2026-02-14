import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { FiPlus, FiUser, FiUsers, FiFilter, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import TaskDetailModal from '../../components/Tasks/TaskDetailModal';
import SprintPlanning from '../../components/Tasks/SprintPlanning';
import SprintReport from '../../components/Tasks/SprintReport';
import { getSprintRange, getInitials, calculateSprint, cn } from '../../lib/utils';

const TaskBoard = () => {
    const { currentOrg, user } = useAuth();
    const [searchParams] = useSearchParams();
    const sprintParam = searchParams.get('sprint');
    
    // Determine active sprint
    const activeSprint = useMemo(() => {
        if (sprintParam) return parseInt(sprintParam);
        return currentOrg ? calculateSprint(currentOrg.createdAt) : 1;
    }, [sprintParam, currentOrg]);

    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]); // Store all to filter client-side
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // View State
    const [activeTab, setActiveTab] = useState('planning'); // 'planning' | 'report'
    const [meMode, setMeMode] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [showAssigneeFilter, setShowAssigneeFilter] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [initialStatus, setInitialStatus] = useState('Todo');

    useEffect(() => {
        if (currentOrg) {
            fetchTasks();
            fetchMembers();
        }
    }, [currentOrg, activeSprint]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            // Fetch tasks for specific sprint
            const { data } = await api.get(`/tasks?sprint=${activeSprint}`);
            setAllTasks(data);
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

    // Apply Filters Client-Side
    useEffect(() => {
        let filtered = [...allTasks];
        
        if (meMode) {
            filtered = filtered.filter(t => t.assignee?._id === user._id);
        }

        if (selectedAssignees.length > 0) {
            filtered = filtered.filter(t => t.assignee && selectedAssignees.includes(t.assignee._id));
        }

        setTasks(filtered);
    }, [meMode, selectedAssignees, allTasks, user]);

    const handleSaveTask = async (taskData) => {
        try {
            // Ensure sprint index is correct
            taskData.sprintIndex = activeSprint;
            
            if (taskData._id) {
                const { data } = await api.put(`/tasks/${taskData._id}`, taskData);
                // Update specific task in state
                setAllTasks(prev => prev.map(t => t._id === taskData._id ? data : t));
                toast.success('Task updated');
                setSelectedTask(data);
            } else {
                const { data } = await api.post('/tasks', taskData);
                setAllTasks(prev => [data, ...prev]);
                toast.success('Task created');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
            throw error;
        }
    };

    const openCreateModal = (status = 'Todo') => {
        setSelectedTask(null);
        setInitialStatus(status);
        setIsModalOpen(true);
    };

    const toggleAssignee = (id) => {
        if (selectedAssignees.includes(id)) {
            setSelectedAssignees(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedAssignees(prev => [...prev, id]);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Sprint Dashboard</h1>
                <p className="text-slate-500 font-medium">
                    {currentOrg ? getSprintRange(currentOrg.createdAt, activeSprint) : 'Loading...'}
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                {/* Tabs */}
                <div className="flex bg-slate-50 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('planning')}
                        className={cn("px-6 py-2 rounded-md text-sm font-semibold transition-all", activeTab === 'planning' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Sprint Planning
                    </button>
                    <button 
                        onClick={() => setActiveTab('report')}
                        className={cn("px-6 py-2 rounded-md text-sm font-semibold transition-all", activeTab === 'report' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Sprint Report
                    </button>
                </div>

                {/* Filters (Only visible in Planning Tab) */}
                {activeTab === 'planning' && (
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button 
                            onClick={() => setMeMode(!meMode)}
                            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors", 
                                meMode ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <FiUser /> Me Mode
                        </button>

                        <div className="relative">
                            <button 
                                onClick={() => setShowAssigneeFilter(!showAssigneeFilter)}
                                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors", 
                                    selectedAssignees.length > 0 ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <FiUsers /> Assignees {selectedAssignees.length > 0 && `(${selectedAssignees.length})`}
                            </button>

                            {/* Assignee Dropdown */}
                            {showAssigneeFilter && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeFilter(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                            <input placeholder="Search member..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500" />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-1">
                                            {members.map(m => (
                                                <button 
                                                    key={m._id}
                                                    onClick={() => toggleAssignee(m._id)}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                                >
                                                    <div className="relative">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                            {getInitials(m.name)}
                                                        </div>
                                                        {selectedAssignees.includes(m._id) && (
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-white">
                                                                <FiCheck />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={cn("text-sm", selectedAssignees.includes(m._id) ? "font-bold text-indigo-900" : "text-slate-700")}>{m.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50">
                            <FiUsers /> Team
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex-1 flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'planning' ? (
                        <SprintPlanning 
                            tasks={tasks} 
                            onEdit={(task) => { setSelectedTask(task); setIsModalOpen(true); }}
                            onCreate={openCreateModal}
                        />
                    ) : (
                        <SprintReport tasks={allTasks} /> 
                    )}
                </>
            )}

            <TaskDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                members={members}
                onSave={handleSaveTask}
                onUpdate={fetchTasks}
                initialStatus={initialStatus}
            />
        </div>
    );
};

export default TaskBoard;