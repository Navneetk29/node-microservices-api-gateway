import { useState, useEffect } from 'react';
import { socket } from '../web-socket';
import DataCard from './dataCard';
import { Layers, AlertCircle, CheckCircle, Cpu, Server, HardDrive, Activity } from 'lucide-react';

export default function LiveSyatemInfo() {
    const [systemData, setSystemData] = useState({});

    useEffect(() => {
        if (!socket) return;

        const handleSystemInfo = (data) => {
            console.log(data);
            setSystemData(data);
        };

        socket.on("system:info", handleSystemInfo);

        return () => {
            socket.off("system:info");
        };
    }, []);

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-10 animate-in fade-in duration-300">
            
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500">
                        <Activity className="w-5 h-5" />
                    </div>
                    System Resources & Telemetry
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Real-time resource utilization for your application gateway and host machine.
                </p>
            </div>

            {/* SECTION 1: Application Metrics */}
            <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    Gateway Application Metrics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataCard
                        name="App CPU Usage"
                        value={systemData?.app?.cpuUsage ?? 0}
                        sign="%"
                        logo={<Cpu className="text-blue-500" strokeWidth={1.5} />}
                        animate={true}
                    />

                    <DataCard
                        name="App Memory Used"
                        value={systemData?.app?.memoryUsedKB ? Number(systemData.app.memoryUsedKB).toLocaleString() : 0}
                        sign="KB"
                        logo={<Layers className="text-emerald-500" strokeWidth={1.5} />}
                        animate={true}
                    />
                </div>
            </div>

            {/* SECTION 2: Host Machine Resources */}
            <div className="space-y-4 pt-4 border-t border-slate-200/60">
                <h2 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-indigo-500" />
                    Host Machine Telemetry
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DataCard
                        name="Overall CPU Usage"
                        value={systemData?.host?.totalCpuUsage ?? 0}
                        sign="%"
                        logo={<Cpu className="text-rose-500" strokeWidth={1.5} />}
                        animate={true}
                    />

                    <DataCard
                        name="Total Host Memory"
                        value={systemData?.host?.totalMemoryMB ? Number(systemData.host.totalMemoryMB).toLocaleString() : 0}
                        sign="MB"
                        logo={<Layers className="text-blue-500" strokeWidth={1.5} />}
                        animate={false}
                    />

                    <DataCard
                        name="Memory Occupied"
                        value={systemData?.host?.usedMemoryMB ? Number(systemData.host.usedMemoryMB).toLocaleString() : 0}
                        sign="MB"
                        logo={<CheckCircle className="text-emerald-500" strokeWidth={1.5} />}
                        animate={true}
                    />

                    <DataCard
                        name="Free Memory"
                        value={systemData?.host?.freeMemoryMB ? Number(systemData.host.freeMemoryMB).toLocaleString() : 0}
                        sign="MB"
                        logo={<AlertCircle className="text-amber-500" strokeWidth={1.5} />}
                        animate={true}
                    />
                </div>
            </div>

        </div>
    );
}