import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, Settings, LogOut, ChartBar } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const loc = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/subjects', icon: BookOpen, label: 'Subjects' },
        { path: '/timetable', icon: Calendar, label: 'Timetable' },
        //{ path: '/reports', icon: ChartBar, label: 'Reports' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="flex min-h-screen">
            <aside className="fixed left-0 top-0 bottom-0 w-64 p-4 z-50">
                <div className="glass-panel h-full rounded-3xl flex flex-col p-6 backdrop-blur-3xl">
                    <div className="text-2xl font-bold text-center mb-10 tracking-tight flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">A</div>
                        <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Attendify</span>
                    </div>

                    <nav className="space-y-2 flex-1">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                    loc.pathname === item.path
                                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg border border-white/10"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={20} className={clsx("transition-colors", loc.pathname === item.path ? "text-blue-400" : "group-hover:text-white")} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-white/10">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group">
                            <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8 animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
}
