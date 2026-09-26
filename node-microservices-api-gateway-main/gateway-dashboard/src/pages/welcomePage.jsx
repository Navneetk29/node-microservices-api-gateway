import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Server, Activity, ShieldCheck, Layers, 
    ArrowRight, Cpu, Gauge, Network 
} from "lucide-react";

export default function WelcomeScreen() {
    const navigate = useNavigate();

    // Framer Motion variants for staggered text loading
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="relative h-screen w-full bg-slate-50 flex items-center justify-center overflow-hidden font-sans selection:bg-cyan-100 selection:text-cyan-900">
            
            {/* Premium Background Effects */}
            {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80"></div> */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-[1400px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
                
                {/* LEFT COLUMN: Typography & CTA */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center text-center lg:items-start lg:text-left pt-10 lg:pt-0"
                >
                    <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100/50 border border-cyan-200/50 text-cyan-700 text-xs font-bold uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        API Gateway v1.0
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-800 tracking-tight leading-[1.1] mb-6">
                        Command Center for your <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                            Microservices
                        </span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-lg text-slate-500 font-medium max-w-xl mb-10 leading-relaxed">
                        Unified routing, real-time metrics, and security. Featuring built-in Redis caching, JWT authentication, and intelligent load balancing.
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <button 
                            onClick={() => navigate('/home')}
                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-500/30"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 text-lg">Enter Dashboard</span>
                            <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* RIGHT COLUMN: The Architecture Blueprint */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative w-full h-[450px] sm:h-[550px] flex items-center justify-center hidden lg:flex"
                >
                    {/* SVG Connecting Lines (The Skeleton) */}
                    <svg className="absolute inset-0 w-full h-full text-slate-200" strokeWidth="2" stroke="currentColor" fill="none">
                        {/* Main Horizontal Flow (Client -> Rate Limit -> Gateway -> LB) */}
                        <path d="M 5% 50% L 75% 50%" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" />
                        {/* Vertical Flow (Redis & Auth connecting to Gateway) */}
                        <path d="M 50% 15% L 50% 85%" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" />
                        {/* Curved Flow (LB to Services) */}
                        <path d="M 75% 50% C 85% 50%, 85% 25%, 95% 25%" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" />
                        <path d="M 75% 50% C 85% 50%, 85% 75%, 95% 75%" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" />
                    </svg>

                    {/* --- ANIMATED DATA PACKETS --- */}
                    
                    {/* 1. Inbound Traffic (Client -> Rate Limiter -> Gateway) */}
                    <motion.div 
                        animate={{ left: ["5%", "50%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] z-0"
                    />

                    {/* 2. Redis Cache Lookup (Gateway -> Redis -> Gateway) */}
                    <motion.div 
                        animate={{ top: ["50%", "15%", "50%"], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-rose-400 rounded-full shadow-[0_0_12px_rgba(251,113,133,0.9)] z-0"
                    />

                    {/* 3. JWT Verification (Gateway -> Auth -> Gateway) */}
                    <motion.div 
                        animate={{ top: ["50%", "85%", "50%"], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.9)] z-0"
                    />

                    {/* 4. Routing to Node 1 (Gateway -> LB -> Node 1) */}
                    <motion.div 
                        animate={{ left: ["50%", "75%", "95%"], top: ["50%", "50%", "25%"], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-violet-400 rounded-full shadow-[0_0_12px_rgba(167,139,250,0.9)] z-0"
                    />

                    {/* 5. Routing to Node 2 (Gateway -> LB -> Node 2) */}
                    <motion.div 
                        animate={{ left: ["50%", "75%", "95%"], top: ["50%", "50%", "75%"], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 2.5 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.9)] z-0"
                    />


                    {/* --- THE ARCHITECTURE NODES --- */}

                    {/* Node: Client Apps */}
                    <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-[5%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-12 h-12 bg-white border border-slate-200 shadow-md rounded-xl flex items-center justify-center text-slate-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">Traffic</span>
                    </motion.div>

                    {/* Node: Rate Limiter */}
                    <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-12 h-12 bg-white border border-amber-100 shadow-lg shadow-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                            <Gauge className="w-6 h-6" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">Rate Limit</span>
                    </motion.div>

                    {/* Node: Redis Cache */}
                    <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute left-[50%] top-[15%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-12 h-12 bg-white border border-rose-100 shadow-lg shadow-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                            <Layers className="w-6 h-6" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">Redis Cache</span>
                    </motion.div>

                    {/* Node: JWT Auth */}
                    <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                        className="absolute left-[50%] top-[85%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-12 h-12 bg-white border border-emerald-100 shadow-lg shadow-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">JWT Auth</span>
                    </motion.div>

                    {/* Node: The Gateway (Center) */}
                    <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl rounded-3xl flex items-center justify-center text-cyan-400">
                                <Cpu className="w-10 h-10" />
                            </div>
                        </div>
                        <span className="mt-3 text-xs font-extrabold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 shadow-sm whitespace-nowrap">Gateway</span>
                    </motion.div>

                    {/* Node: Load Balancer */}
                    <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        className="absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-12 h-12 bg-white border border-violet-100 shadow-lg shadow-violet-500/10 rounded-full flex items-center justify-center text-violet-500">
                            <Network className="w-6 h-6" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">Balancer</span>
                    </motion.div>

                    {/* Node: Service 1 */}
                    <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                        className="absolute left-[95%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-10 h-10 bg-white border border-blue-100 shadow-md shadow-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                            <Server className="w-5 h-5" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">Node 1</span>
                    </motion.div>

                    {/* Node: Service 2 */}
                    <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                        className="absolute left-[95%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    >
                        <div className="w-10 h-10 bg-white border border-blue-100 shadow-md shadow-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                            <Server className="w-5 h-5" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-1">Node 2</span>
                    </motion.div>

                </motion.div>
            </div>

            {/* Custom CSS for animating the dashed SVG lines */}
            <style>
                {`
                    @keyframes dash {
                        to { stroke-dashoffset: -100; }
                    }
                `}
            </style>
        </div>
    );
}