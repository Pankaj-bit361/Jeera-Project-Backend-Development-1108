import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FiBarChart2 } from 'react-icons/fi';

const Analytics = () => {
    const { currentOrg } = useAuth();
    const [distribution, setDistribution] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const pieOption = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', left: 'center' },
        series: [
            {
                name: 'Tasks',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false, position: 'center' },
                emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
                data: distribution.map(d => ({ value: d.count, name: d.name }))
            }
        ]
    };

    const barOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [
            {
                type: 'category',
                data: performance.map(p => p.name),
                axisTick: { alignWithLabel: true }
            }
        ],
        yAxis: [{ type: 'value' }],
        series: [
            {
                name: 'Completed Tasks',
                type: 'bar',
                barWidth: '60%',
                data: performance.map(p => p.completedCount),
                itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] }
            }
        ]
    };

    if (loading) return <div className="flex justify-center p-12">Loading analytics...</div>;

    return (
        <div>
             <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-500">Visualize team performance and workload</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiBarChart2 className="text-indigo-600" /> Task Distribution
                    </h3>
                    <div className="h-[350px]">
                        <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiBarChart2 className="text-emerald-600" /> Team Performance
                    </h3>
                    <div className="h-[350px]">
                        <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;