import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { FiClipboard, FiClock, FiCheckCircle, FiZap, FiActivity } from 'react-icons/fi';

const StatCard = ({ title, count, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${color}`}>{count}</span>
                <span className="text-xs text-slate-400">tasks</span>
            </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`text-xl ${color}`} />
        </div>
    </div>
);

const SprintReport = ({ tasks }) => {
    const stats = useMemo(() => {
        return {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'Todo').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            done: tasks.filter(t => t.status === 'Done').length
        };
    }, [tasks]);

    const distribution = useMemo(() => {
        const dist = {};
        tasks.forEach(t => {
            const name = t.assignee?.name || 'Unassigned';
            dist[name] = (dist[name] || 0) + 1;
        });
        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    // Workload Chart (Bar)
    const workloadOption = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['To-do', 'In-Progress', 'Closed'], axisLine: { show: false }, axisTick: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
        series: [{
            data: [
                { value: stats.todo, itemStyle: { color: '#94a3b8' } },
                { value: stats.inProgress, itemStyle: { color: '#4f46e5' } },
                { value: stats.done, itemStyle: { color: '#10b981' } }
            ],
            type: 'bar',
            barWidth: '25%',
            itemStyle: { borderRadius: [4, 4, 0, 0] }
        }]
    };

    // Distribution Chart (Donut)
    const distributionOption = {
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', right: 10, top: 'center', itemWidth: 10, itemHeight: 10 },
        series: [{
            name: 'Tasks',
            type: 'pie',
            radius: ['60%', '80%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            data: distribution
        }]
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Tasks" count={stats.total} icon={FiClipboard} color="text-indigo-600" bg="bg-indigo-50" />
                <StatCard title="To-Do" count={stats.todo} icon={FiClock} color="text-slate-600" bg="bg-slate-50" />
                <StatCard title="In-Progress" count={stats.inProgress} icon={FiZap} color="text-orange-500" bg="bg-orange-50" />
                <StatCard title="Closed" count={stats.done} icon={FiCheckCircle} color="text-emerald-500" bg="bg-emerald-50" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Work Load</h3>
                        <FiActivity className="text-slate-400" />
                    </div>
                    <ReactECharts option={workloadOption} style={{ height: '300px' }} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Task Distribution</h3>
                        <FiActivity className="text-slate-400" />
                    </div>
                    <ReactECharts option={distributionOption} style={{ height: '300px' }} />
                </div>
            </div>
        </div>
    );
};

export default SprintReport;