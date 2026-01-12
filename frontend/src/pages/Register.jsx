import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('register/', formData);
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Registration failed. Username may be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">Create Account</h2>
                    <p className="text-white/50">Join to start tracking your attendance</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                            <input
                                className="glass-input w-full pl-12"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                            <input
                                type="email"
                                className="glass-input w-full pl-12"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="example@mail.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-pink-400 transition-colors" />
                            <input
                                type="password"
                                className="glass-input w-full pl-12"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="glass-btn w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Register <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-white/40">
                    Already have an account? <Link to="/login" className="text-pink-400 hover:text-pink-300 hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
