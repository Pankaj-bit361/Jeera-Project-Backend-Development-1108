import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiPlayCircle, FiMoreHorizontal, FiCheckCircle, FiActivity, FiTag, FiPlus, FiStopCircle, FiPause } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import ReactECharts from 'echarts-for-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { currentOrg } = useAuth();
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [tasks, setTasks] = useState([]); // For dropdown
    
    // Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [showTaskSelector, setShowTaskSelector] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (currentOrg) {
            fetchData();
        }
    }, [currentOrg]);

    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [timerActive]);

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes, allTasksRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/tasks/me'),
                api.get('/tasks?status=In Progress')
            ]);
            setStats(statsRes.data);
            setRecentTasks(tasksRes.data.slice(0, 5));
            setTasks(allTasksRes.data); // Tasks available for tracking
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const toggleTimer = async () => {
        if (timerActive) {
            // Stop Timer and Save
            setTimerActive(false);
            if (activeTaskId) {
                try {
                    // Update task with added time
                    // First fetch current task to get existing timeSpent
                    const currentTask = tasks.find(t => t._id === activeTaskId);
                    const newTime = (currentTask?.timeSpent || 0) + seconds;
                    
                    await api.put(`/tasks/${activeTaskId}`, { timeSpent: newTime });
                    toast.success(`Logged ${formatTime(seconds)} to task`);
                    setSeconds(0);
                    setActiveTaskId(null);
                    fetchData(); // Refresh to see updates
                } catch (e) {
                    toast.error("Failed to save time");
                }
            } else {
                setSeconds(0); // Just reset if no task
            }
        } else {
            // Start Timer
            if (!activeTaskId) {
                setShowTaskSelector(true);
            } else {
                setTimerActive(true);
            }
        }
    };

    const startTaskTimer = (taskId) => {
        setActiveTaskId(taskId);
        setShowTaskSelector(false);
        setTimerActive(true);
    };

    // Timeline Chart Option
    const chartOption = {
        grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
        tooltip: { trigger: 'axis' },
        xAxis: { 
            type: 'category', 
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#94A3B8' }
        },
        yAxis: { 
            type: 'value',
            splitLine: { lineStyle: { type: 'dashed', color: '#E2E8F0' } },
            axisLabel: { color: '#94A3B8' }
        },
        series: [{
            data: [12, 18, 15, 25, 20, 10, 15],
            type: 'bar',
            itemStyle: { 
                borderRadius: [4, 4, 0, 0],
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{ offset: 0, color: '#F97316' }, { offset: 1, color: '#FB923C' }]
                }
            },
            barWidth: '20%'
        }]
    };

    return (
        <div className="space-y-8">
            {/* Top Section: Real Timer UI */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-visible">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FiClock className="text-orange-500" /> Time Tracker
                    </h2>
                    {activeTaskId && (
                        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full animate-pulse">
                            Recording...
                        </span>
                    )}
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="relative">
                        <button 
                            onClick={() => setShowTaskSelector(!showTaskSelector)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 flex items-center gap-2 w-full md:w-64 justify-between"
                        >
                            <span className="truncate">{activeTaskId ? tasks.find(t => t._id === activeTaskId)?.title : "Select task to track..."}</span>
                            <FiPlus />
                        </button>
                        
                        {showTaskSelector && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-1">
                                {tasks.length > 0 ? tasks.map(t => (
                                    <div 
                                        key={t._id} 
                                        onClick={() => startTaskTimer(t._id)}
                                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-700 truncate"
                                    >
                                        {t.title}
                                    </div>
                                )) : (
                                    <div className="p-3 text-center text-xs text-slate-400">No active tasks found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 w-full text-center hidden md:block">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Current Session</span>
                    </div>

                    <div className="flex items-center gap-6 px-4">
                        <div className="text-3xl font-mono font-bold text-slate-800 tabular-nums">
                            {formatTime(seconds)}
                        </div>
                    </div>
                    
                    <Button 
                        onClick={toggleTimer}
                        variant={timerActive ? "danger" : "primary"} 
                        className={`w-full md:w-auto min-w-[120px] ${timerActive ? 'shadow-red-500/20' : 'shadow-orange-500/20'}`}
                    >
                        {timerActive ? (
                            <>Stop <FiStopCircle className="ml-2" /></>
                        ) : (
                            <>Start <FiPlayCircle className="ml-2" /></>
                        )}
                    </Button>
                </div>
            </div>

            {/* Middle Section: Timeline Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Activity Timeline</h2>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Focus</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Meetings</span>
                    </div>
                </div>
                <div className="h-64 w-full">
                     <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
                </div>
            </div>

            {/* Bottom Section: Task List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Today's Tasks</h2>
                        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                </div>
                
                <div className="divide-y divide-slate-50">
                    {recentTasks.length > 0 ? recentTasks.map((task, index) => (
                        <div key={task._id} className="group flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 truncate">{task.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-orange-500' : 'bg-slate-300'}`}></span>
                                    <span className="text-xs text-slate-500 font-medium">Sprint {task.sprintIndex || 1}</span>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-mono">
                                <span className={task.timeSpent > 0 ? "text-slate-700 font-bold" : "text-slate-300"}>
                                    {task.timeSpent ? formatTime(task.timeSpent) : '--:--:--'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => startTaskTimer(task._id)}
                                    className="p-2 text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                    title="Start Timer for this task"
                                >
                                    <FiPlayCircle className="text-xl" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <FiMoreHorizontal />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <FiActivity className="text-2xl" />
                            </div>
                            <p className="text-slate-500 font-medium">No tasks for today</p>
                            <Button variant="ghost" className="mt-2 text-orange-500" onClick={() => window.location.href='/tasks'}>Create Task</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;