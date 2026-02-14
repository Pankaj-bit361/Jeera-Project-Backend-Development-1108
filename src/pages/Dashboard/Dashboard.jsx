import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiPlayCircle, FiMoreHorizontal, FiActivity, FiPlus, FiStopCircle } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import ReactECharts from 'echarts-for-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { currentOrg } = useAuth();
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [tasks, setTasks] = useState([]); 
    const [activityData, setActivityData] = useState({});
    
    // Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [startTime, setStartTime] = useState(null);
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
            const [statsRes, tasksRes, allTasksRes, activityRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/tasks/me'),
                api.get('/tasks?status=In Progress'),
                api.get('/analytics/activity')
            ]);
            setStats(statsRes.data);
            setRecentTasks(tasksRes.data.slice(0, 5));
            setTasks(allTasksRes.data);
            setActivityData(activityRes.data);
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
            const endTime = new Date();
            setTimerActive(false);
            if (activeTaskId) {
                try {
                    await api.post(`/tasks/${activeTaskId}/time`, {
                        duration: seconds,
                        startTime: startTime,
                        endTime: endTime
                    });
                    
                    toast.success(`Logged ${formatTime(seconds)}`);
                    setSeconds(0);
                    setActiveTaskId(null);
                    setStartTime(null);
                    fetchData(); // Refresh to see updates in chart
                } catch (e) {
                    toast.error("Failed to save time");
                }
            } else {
                setSeconds(0);
            }
        } else {
            // Start Timer
            if (!activeTaskId) {
                setShowTaskSelector(true);
            } else {
                setStartTime(new Date());
                setTimerActive(true);
            }
        }
    };

    const startTaskTimer = (taskId) => {
        setActiveTaskId(taskId);
        setShowTaskSelector(false);
        setStartTime(new Date());
        setTimerActive(true);
    };

    // Real Activity Chart Option
    const chartOption = {
        grid: { top: 30, right: 30, bottom: 20, left: 40, containLabel: true },
        tooltip: { 
            trigger: 'axis',
            formatter: '{b}: {c} mins'
        },
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
        legend: { right: 0, top: 0, icon: 'circle' },
        series: [{
            name: 'Focus',
            data: [
                activityData['Mon'] || 0,
                activityData['Tue'] || 0,
                activityData['Wed'] || 0,
                activityData['Thu'] || 0,
                activityData['Fri'] || 0,
                activityData['Sat'] || 0,
                activityData['Sun'] || 0
            ],
            type: 'bar',
            itemStyle: { 
                borderRadius: [4, 4, 0, 0],
                color: '#F97316' // Orange
            },
            barWidth: '20%'
        }]
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Section: Real Timer UI */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-visible">
                <div className="flex items-center gap-3 mb-6">
                    <FiClock className="text-orange-500 text-xl" />
                    <h2 className="text-xl font-bold text-slate-900">Time Tracker</h2>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 items-center bg-[#F8F9FA] p-3 rounded-2xl border border-slate-100">
                    <div className="relative w-full md:w-auto">
                        <button 
                            onClick={() => setShowTaskSelector(!showTaskSelector)}
                            disabled={timerActive}
                            className="w-full md:w-72 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 shadow-sm hover:bg-white hover:border-slate-300 flex items-center justify-between transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="truncate">{activeTaskId ? tasks.find(t => t._id === activeTaskId)?.title : "Select task to track..."}</span>
                            <FiPlus className="text-slate-400" />
                        </button>
                        
                        {showTaskSelector && !timerActive && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-1 animate-in zoom-in-95 duration-200">
                                {tasks.length > 0 ? tasks.map(t => (
                                    <div 
                                        key={t._id} 
                                        onClick={() => startTaskTimer(t._id)}
                                        className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-700 truncate font-medium"
                                    >
                                        {t.title}
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-xs text-slate-400">No active tasks found in 'In Progress'</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 w-full text-center hidden md:block">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Current Session</span>
                    </div>

                    <div className="flex items-center gap-6 px-4">
                        <div className="text-4xl font-mono font-bold text-slate-800 tabular-nums tracking-wider">
                            {formatTime(seconds)}
                        </div>
                    </div>
                    
                    <Button 
                        onClick={toggleTimer}
                        className={`w-full md:w-auto min-w-[140px] py-3.5 text-base ${timerActive ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/25'}`}
                    >
                        {timerActive ? (
                            <span className="flex items-center justify-center gap-2">Stop <FiStopCircle /></span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">Start <FiPlayCircle /></span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Middle Section: Activity Timeline */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Activity Timeline</h2>
                    {/* Legend handled by ECharts */}
                </div>
                <div className="h-72 w-full">
                     <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
                </div>
            </div>

            {/* Bottom Section: Task List */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Today's Tasks</h2>
                    <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                
                <div className="divide-y divide-slate-50">
                    {recentTasks.length > 0 ? recentTasks.map((task, index) => (
                        <div key={task._id} className="group flex items-center gap-5 p-6 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-100">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 truncate text-base">{task.title}</h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-orange-500' : 'bg-slate-300'}`}></span>
                                    <span className="text-xs text-slate-500 font-medium">Sprint {task.sprintIndex || 1} • {task.status}</span>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-mono">
                                <span className={task.timeSpent > 0 ? "text-slate-700 font-bold bg-slate-100 px-2 py-1 rounded" : "text-slate-300"}>
                                    {task.timeSpent ? formatTime(task.timeSpent) : '--:--:--'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => startTaskTimer(task._id)}
                                    className="p-2.5 text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                                    title="Start Timer"
                                >
                                    <FiPlayCircle className="text-xl" />
                                </button>
                                <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100 rounded-xl">
                                    <FiMoreHorizontal className="text-xl" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <FiActivity className="text-3xl" />
                            </div>
                            <p className="text-slate-500 font-medium text-lg">No tasks assigned for today</p>
                            <Button variant="ghost" className="mt-4 text-orange-600 font-bold" onClick={() => window.location.href='/tasks'}>Create New Task</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;