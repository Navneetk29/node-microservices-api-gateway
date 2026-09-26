import { NavLink } from "react-router-dom";
import { LayoutDashboard, Home, Clock, Activity } from "lucide-react";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="mx-auto px-4 sm:px-8 md:px-12">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8 lg:gap-12">

                        {/* Title with Logo */}
                        <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                                <LayoutDashboard className="h-5 w-5" />
                            </div>
                            Gateway Dashboard
                        </h1>

                        {/* Navigation Links */}
                        <nav className="flex items-center gap-2">
                            <NavLink
                                to="/home"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                    }`
                                }
                            >
                                <Home className="h-4 w-4" strokeWidth={2.5} />
                                <span>Home</span>
                            </NavLink>

                            <NavLink
                                to="/recent"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                    }`
                                }
                            >
                                <Clock className="h-4 w-4" strokeWidth={2.5} />
                                <span>Recent</span>
                            </NavLink>

                            <NavLink
                                to="/live"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive
                                        ? "bg-green-100 text-green-900"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-green-50"
                                    }`
                                }
                            >
                                <Activity className="h-4 w-4" strokeWidth={2.5} />
                                <span>Live</span>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                            </NavLink>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}