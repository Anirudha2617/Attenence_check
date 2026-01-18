import { useEffect, useState } from 'react';
import { getSubjects, createSubject } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Book, Calendar, CheckCircle } from 'lucide-react';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = () => getSubjects().then(res => setSubjects(res.data));

    const handleCreate = async (e) => {
        e.preventDefault();
        await createSubject({ name: newSubject });
        setNewSubject('');
        setShowModal(false);
        fetchSubjects();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Subjects</h1>
                    <p className="text-gray-400">Manage your course list and track individual progress.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="glass-btn glass-btn-primary">
                    <Plus size={20} /> Add Subject
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(sub => (
                    <div
                        key={sub.id}
                        onClick={() => navigate(`/subjects/${sub.id}`)}
                        className="glass-card p-6 flex flex-col justify-between min-h-[220px] group hover:border-blue-500/30 transition-all relative overflow-hidden cursor-pointer"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Book size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-lg shadow-blue-500/10">
                                    <Book size={24} />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-xl font-bold text-white tracking-wide">{sub.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{sub.total_classes} Classes Total</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Calendar size={16} className="text-blue-400" />
                                    <span>
                                        Next: <span className="text-white font-medium">
                                            {sub.next_class ? `${sub.next_class.day}, ${sub.next_class.time}` : 'No upcoming classes'}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <CheckCircle size={16} className={sub.last_attended ? "text-green-400" : "text-gray-600"} />
                                    <span>
                                        Last Attended: <span className="text-gray-300">
                                            {sub.last_attended || 'Never'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className={sub.attendance_percentage >= 75 ? "text-green-400" : "text-red-400"}>
                                    {sub.attendance_percentage}% Attendance
                                </span>
                                <span className="text-gray-500">Target: 75%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 h-2.5 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${sub.attendance_percentage >= 75 ? 'bg-green-500' :
                                        sub.attendance_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${sub.attendance_percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="glass-panel p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-2">Add New Subject</h2>
                        <p className="text-gray-400 mb-6 text-sm">Create a new container for your classes.</p>
                        <form onSubmit={handleCreate}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
                                <input
                                    className="glass-input w-full"
                                    placeholder="e.g. Advanced Calculus"
                                    value={newSubject}
                                    onChange={e => setNewSubject(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="glass-btn glass-btn-secondary">Cancel</button>
                                <button type="submit" className="glass-btn glass-btn-primary px-6">Create Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
