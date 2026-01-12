import { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, XCircle, RefreshCw, Check, X, Ban, Loader2, TrendingUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ percent: 0, attended: 0, total: 0 });
    const [subjectStats, setSubjectStats] = useState([]);
    const [dailyStats, setDailyStats] = useState([]);
    const [todaySessions, setTodaySessions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        // Fetch User and Stats
        api.get('me/').then(res => setUser(res.data));
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('dashboard-stats/');
            setStats(res.data.stats);
            setTodaySessions(res.data.todaySessions);
            setSubjectStats(res.data.subjectStats);
            setDailyStats(res.data.dailyStats);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        try {
            await api.patch(`sessions/${id}/`, { status });
            fetchDashboardData(); // Refresh stats immediately
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-white/10 p-3 rounded-lg shadow-xl">
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-blue-300">
                        {payload[0].name}: {payload[0].value}
                    </p>
                    {payload[1] && (
                        <p className="text-gray-400">
                            {payload[1].name}: {payload[1].value}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.username}
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Your attendance analytics dashboard.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={fetchDashboardData} className="glass-btn glass-btn-secondary p-3" disabled={refreshing}>
                        <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
            </header>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group md:col-span-2">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle size={120} />
                    </div>
                    <h3 className="text-gray-400 font-medium mb-1">Overall Attendance</h3>
                    <div className="flex items-end gap-3">
                        <div className="text-6xl font-bold text-green-400">{stats.percent}%</div>
                        <div className="text-lg text-gray-400 mb-2">avg</div>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-400 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Calendar size={80} />
                    </div>
                    <h3 className="text-gray-400 font-medium mb-1">Total Classes</h3>
                    <div className="text-4xl font-bold text-white">{stats.total}</div>
                    <p className="text-xs text-gray-500 mt-2">Active sessions (excl. cancelled)</p>
                </div>

                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <h3 className="text-gray-400 font-medium mb-1">Present</h3>
                    <div className="text-4xl font-bold text-blue-400">{stats.attended}</div>
                    <p className="text-xs text-gray-500 mt-2">Classes attended so far</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Wise Performance */}
                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <BarChart2 size={20} className="text-blue-400" /> Subject Performance
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectStats} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="percent" name="Attendance %" radius={[0, 4, 4, 0]} barSize={20}>
                                    {subjectStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percent >= 75 ? '#4ade80' : entry.percent >= 50 ? '#fbbf24' : '#f87171'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Trend */}
                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-400" /> Weekly Trend
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyStats}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="present" stroke="#60a5fa" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
                                <Area type="monotone" dataKey="total" stroke="#4b5563" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-white/90">Today's Schedule</h2>
                <div className="glass-panel rounded-3xl overflow-hidden p-1">
                    <table className="w-full text-left">
                        <thead className="text-gray-400 border-b border-white/5">
                            <tr>
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Time</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Update Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {todaySessions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">No classes scheduled for today.</td>
                                </tr>
                            ) : (
                                todaySessions.map(session => (
                                    <tr key={session.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{session.subject}</td>
                                        <td className="p-4 text-gray-400">{session.time}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                                ${session.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                                                    session.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' :
                                                        session.status === 'CANCELLED' ? 'bg-gray-500/20 text-gray-500 decoration-line-through' :
                                                            'bg-gray-500/20 text-gray-400'}`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {updatingId === session.id ? (
                                                    <Loader2 className="animate-spin text-blue-400" />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(session.id, 'PRESENT')}
                                                            title="Mark Present"
                                                            className={`p-2 rounded-lg transition-colors ${session.status === 'PRESENT' ? 'bg-green-500 text-white' : 'hover:bg-green-500/20 text-green-400'}`}
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(session.id, 'ABSENT')}
                                                            title="Mark Absent"
                                                            className={`p-2 rounded-lg transition-colors ${session.status === 'ABSENT' ? 'bg-red-500 text-white' : 'hover:bg-red-500/20 text-red-400'}`}
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(session.id, 'CANCELLED')}
                                                            title="Cancel Class"
                                                            className={`p-2 rounded-lg transition-colors ${session.status === 'CANCELLED' ? 'bg-gray-600 text-white' : 'hover:bg-gray-500/20 text-gray-400'}`}
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
