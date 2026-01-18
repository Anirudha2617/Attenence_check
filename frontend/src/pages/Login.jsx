import { useState } from 'react';
import { login } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await login(username, password);
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">Welcome Back</h2>
                    <p className="text-white/50">Enter your credentials to access your dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                className="glass-input w-full pl-12"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ex. johndoe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="glass-input w-full pl-12 pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-white/40 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="glass-btn glass-btn-primary w-full mt-4"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-white/40">
                    Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline">Register</Link>
                </div>
            </div >
        </div >
    );
}
