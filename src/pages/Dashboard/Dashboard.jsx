import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FiCheckCircle, FiClock, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="text-xl text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { currentOrg, user } = useAuth();
    const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
    const [recentTasks, setRecentTasks] = useState([]);

    useEffect(() => {
        if (currentOrg) {
            fetchData();
        }
    }, [currentOrg]);

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/tasks/me')
            ]);
            setStats(statsRes.data);
            setRecentTasks(tasksRes.data.slice(0, 5));
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name.split(' ')[0]} 👋</h1>
                <p className="text-gray-500">Here's what's happening in {currentOrg?.name} today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Total Tasks" 
                    value={stats.totalTasks} 
                    icon={FiActivity} 
                    color="bg-indigo-500" 
                />
                <StatCard 
                    title="Pending" 
                    value={stats.pendingTasks} 
                    icon={FiClock} 
                    color="bg-orange-500" 
                />
                <StatCard 
                    title="Completed" 
                    value={stats.completedTasks} 
                    icon={FiCheckCircle} 
                    color="bg-emerald-500" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Recent Tasks */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">My Tasks</h2>
                        <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {recentTasks.length > 0 ? recentTasks.map(task => (
                            <div key={task._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                        <p className="text-xs text-gray-500">{task.status}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm text-center py-4">No tasks assigned to you yet.</p>
                        )}
                    </div>
                </div>

                {/* Quick Invite Box */}
                <div className="bg-indigo-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold mb-2">Grow your team</h2>
                        <p className="text-indigo-200 text-sm mb-6 max-w-xs">Invite colleagues to {currentOrg?.name} and start collaborating instantly.</p>
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm mb-4">
                            <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-1">Invite Code</p>
                            <p className="text-2xl font-mono font-bold tracking-widest">{currentOrg?.inviteCode}</p>
                        </div>
                        <Link to="/team" className="inline-block bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                            Manage Team
                        </Link>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;