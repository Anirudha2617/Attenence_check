import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubject, getSessions, updateSessionStatus } from '../services/api';
import { ArrowLeft, Calendar, Check, X, Ban, Loader2, Clock } from 'lucide-react';

export default function SubjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [subRes, sessRes] = await Promise.all([
                getSubject(id),
                getSessions({ subject: id })
            ]);
            setSubject(subRes.data);
            // Sort sessions: Future to Past
            const sortedSessions = sessRes.data.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));
            setSessions(sortedSessions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (sessionId, status) => {
        setUpdatingId(sessionId);
        try {
            await updateSessionStatus(sessionId, status);
            // Refresh stats locally or fetch again. Fetching again ensures percentage correctness.
            fetchData();
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
    if (!subject) return <div className="text-center text-gray-400 mt-20">Subject not found</div>;

    // Group sessions by Month
    const grouped = sessions.reduce((acc, session) => {
        const month = new Date(session.scheduled_date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(session);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} /> Back to Subjects
            </button>

            {/* Header / Stats */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
                    <div className="flex gap-6 text-sm text-gray-300">
                        <span>Total Classes: <span className="text-white font-bold">{subject.total_classes}</span></span>
                        <span>Current Attendance: <span className={`font-bold ${subject.attendance_percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>{subject.attendance_percentage}%</span></span>
                    </div>
                </div>
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 h-1 bg-green-500/50 transition-all duration-1000" style={{ width: `${subject.attendance_percentage}%` }}></div>
            </div>

            {/* History List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-200">
                    Attendance History
                </h2>

                {Object.keys(grouped).map(month => (
                    <div key={month} className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-blue-500/30">{month}</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {grouped[month].map(session => (
                                <div key={session.id} className={`glass-card p-4 flex items-center justify-between group hover:border-white/10 transition-all ${session.status === 'CANCELLED' ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${session.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                                                session.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div className={`font-semibold text-lg ${session.status === 'CANCELLED' ? 'line-through text-gray-500' : 'text-white'}`}>
                                                {new Date(session.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="text-sm text-gray-400 flex items-center gap-1">
                                                <Clock size={12} /> {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {updatingId === session.id ? (
                                            <Loader2 className="animate-spin text-blue-400" />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(session.id, 'PRESENT')}
                                                    className={`p-2 rounded-lg transition-colors ${session.status === 'PRESENT' ? 'bg-green-500 text-white' : 'glass-btn-secondary hover:bg-green-500/20 hover:text-green-400'}`}
                                                    title="Mark Present"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(session.id, 'ABSENT')}
                                                    className={`p-2 rounded-lg transition-colors ${session.status === 'ABSENT' ? 'bg-red-500 text-white' : 'glass-btn-secondary hover:bg-red-500/20 hover:text-red-400'}`}
                                                    title="Mark Absent"
                                                >
                                                    <X size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(session.id, 'CANCELLED')}
                                                    className={`p-2 rounded-lg transition-colors ${session.status === 'CANCELLED' ? 'bg-gray-600 text-white' : 'glass-btn-secondary hover:bg-gray-500/20 hover:text-gray-400'}`}
                                                    title="Cancel Class (Exclude from stats)"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
