import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FiBarChart2, FiX, FiCheckCircle, FiZap } from 'react-icons/fi';
import { getInitials } from '../../lib/utils';

const Analytics = () => {
    const { currentOrg } = useAuth();
    const [distribution, setDistribution] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userTasks, setUserTasks] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (currentOrg) fetchAnalytics();
    }, [currentOrg]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [distRes, perfRes] = await Promise.all([
                api.get('/analytics/distribution'),
                api.get('/analytics/performance')
            ]);
            setDistribution(distRes.data);
            setPerformance(perfRes.data);
        } catch (error) {
            console.error("Error fetching analytics");
        } finally {
            setLoading(false);
        }
    };

    const handleChartClick = async (params) => {
        const userId = distribution.find(d => d.name === params.name)?.userId;
        if (userId) {
            setSelectedUser({ name: params.name, id: userId, points: params.value });
            setModalLoading(true);
            try {
                // Fetch tasks for this specific user
                const { data } = await api.get(`/tasks?assignee=${userId}`);
                setUserTasks(data);
            } catch (e) {
                console.error("Failed to fetch user tasks");
            } finally {
                setModalLoading(false);
            }
        }
    };

    // Chart Configuration: Use Total Points (Weight) instead of Count
    const pieOption = {
        tooltip: { 
            trigger: 'item',
            formatter: '{b}: {c} Points ({d}%)' 
        },
        legend: { bottom: '5%', left: 'center' },
        series: [
            {
                name: 'Sprint Points',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
                data: distribution.map(d => ({ value: d.totalPoints, name: d.name }))
            }
        ]
    };

    const barOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [
            { type: 'category', data: performance.map(p => p.name), axisTick: { alignWithLabel: true } }
        ],
        yAxis: [{ type: 'value', name: 'Points Completed' }],
        series: [
            {
                name: 'Completed Points',
                type: 'bar',
                barWidth: '60%',
                data: performance.map(p => p.completedPoints),
                itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] }
            }
        ]
    };

    const onEvents = {
        'click': handleChartClick
    };

    if (loading) return <div className="flex justify-center p-12">Loading analytics...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-500">Visualize team performance based on Sprint Points (Weight)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group">
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Click slice for details</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiBarChart2 className="text-indigo-600" /> Workload (Sprint Points)
                    </h3>
                    <div className="h-[350px]">
                        <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} onEvents={onEvents} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiBarChart2 className="text-emerald-600" /> Velocity (Completed Points)
                    </h3>
                    <div className="h-[350px]">
                        <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {getInitials(selectedUser.name)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                        <FiZap className="text-orange-500" /> Total Weight: <span className="text-gray-900">{selectedUser.points} Points</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><FiX /></button>
                        </div>
                        
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {modalLoading ? (
                                <div className="text-center py-8">Loading tasks...</div>
                            ) : userTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {userTasks.map(task => (
                                        <div key={task._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{task.title}</p>
                                                    <p className="text-xs text-gray-400">Sprint {task.sprintIndex || 1} • {task.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                                <FiZap className="text-orange-500 text-sm" />
                                                <span className="font-bold text-orange-700 text-sm">{task.sprintPoints || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">No tasks assigned to this user.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;