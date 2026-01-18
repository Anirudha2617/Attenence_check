import { useEffect, useState } from 'react';
import { getTimetables, getSubjects, createTimetableEntry, deleteTimetableEntry, generateSessions } from '../services/api';
import { Clock, Plus, Trash2, RefreshCw } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Timetable() {
    const [timetable, setTimetable] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [entry, setEntry] = useState({
        subject_id: '',
        day_of_week: 0,
        start_time: '09:00',
        end_time: '10:00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        auto_renew: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [ttRes, subRes] = await Promise.all([
            getTimetables(),
            getSubjects()
        ]);
        setTimetable(ttRes.data);
        setSubjects(subRes.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...entry, end_date: entry.end_date || null };
            await createTimetableEntry(payload);
            setShowModal(false);
            fetchData();
            // Reset crucial fields
            setEntry(prev => ({ ...prev, subject_id: '' }));
        } catch (err) {
            console.error("Failed to add timetable entry", err);
            alert("Failed to create entry. Please check the duration and subject.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will stop future auto-generations.")) return;
        try {
            await deleteTimetableEntry(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateNow = async () => {
        setLoading(true);
        try {
            const res = await generateSessions();
            alert(res.data.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Group by day
    const timetableByDay = DAYS.map((day, index) => ({
        day,
        index,
        entries: timetable.filter(t => t.day_of_week === index).sort((a, b) => a.start_time.localeCompare(b.start_time))
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-gradient-to-r from-blue-500/10 to-transparent p-6 rounded-3xl border border-white/5">
                <div>
                    <h1 className="text-3xl font-bold">Weekly Schedule</h1>
                    <p className="text-gray-400">Manage your recurring class routine.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleGenerateNow} disabled={loading} className="glass-btn glass-btn-secondary">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sync Now
                    </button>
                    <button onClick={() => setShowModal(true)} className="glass-btn glass-btn-primary">
                        <Plus size={20} /> Add Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-7 lg:grid-cols-4 md:grid-cols-2 gap-4">
                {timetableByDay.map(({ day, index, entries }) => (
                    <div key={day} className={`glass-panel p-4 rounded-xl flex flex-col h-full min-h-[300px] ${entries.length === 0 ? 'opacity-70 grayscale' : ''}`}>
                        <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2">
                            {day.slice(0, 3)}
                        </h3>

                        <div className="space-y-2 flex-1">
                            {entries.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/10">
                                    <span className="text-2xl font-bold mb-1">{day.slice(0, 3)}</span>
                                    <span className="text-xs">Rest Day</span>
                                </div>
                            ) : (
                                entries.map(item => (
                                    <div key={item.id} className="bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-lg group transition-all cursor-default">
                                        <div className="text-xs font-semibold text-blue-300 mb-1 flex items-center gap-1">
                                            <Clock size={10} />
                                            {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                        </div>
                                        <div className="font-bold text-white leading-tight mb-2">{item.subject_name}</div>

                                        <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-2">
                                            <span className="text-[10px] text-gray-500">
                                                {item.auto_renew ? 'Auto-renews' : 'One-time'}
                                            </span>
                                            <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="glass-panel p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Schedule Class</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                                <select
                                    className="glass-input w-full [&>option]:text-black"
                                    value={entry.subject_id}
                                    onChange={e => setEntry({ ...entry, subject_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Day of Week</label>
                                <select
                                    className="glass-input w-full [&>option]:text-black"
                                    value={entry.day_of_week}
                                    onChange={e => setEntry({ ...entry, day_of_week: parseInt(e.target.value) })}
                                >
                                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="glass-input w-full"
                                        value={entry.start_time}
                                        onChange={e => setEntry({ ...entry, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="glass-input w-full"
                                        value={entry.end_time}
                                        onChange={e => setEntry({ ...entry, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Effective From</label>
                                    <input
                                        type="date"
                                        className="glass-input w-full"
                                        value={entry.start_date}
                                        onChange={e => setEntry({ ...entry, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Ends On (Optional)</label>
                                    <input
                                        type="date"
                                        className="glass-input w-full"
                                        value={entry.end_date}
                                        onChange={e => setEntry({ ...entry, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="auto_renew"
                                    checked={entry.auto_renew}
                                    onChange={e => setEntry({ ...entry, auto_renew: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-gray-700"
                                />
                                <label htmlFor="auto_renew" className="text-sm text-gray-300">Auto-renew weekly</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="glass-btn glass-btn-secondary">Cancel</button>
                                <button type="submit" disabled={loading} className="glass-btn glass-btn-primary">
                                    {loading ? 'Saving...' : 'Add to Timetable'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
