import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import DataCard from './dataCard';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { Layers, AlertCircle, CheckCircle } from 'lucide-react';
import { socket } from '../web-socket';



// Custom Tooltip matching your dashboard's aesthetic
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Format the raw timestamp label into '10:58:03 AM'
        const displayTime = label
            ? new Date(Number(label)).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            })
            : "";

        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col gap-2 min-w-[160px] text-sm z-50 transition-all">
                {displayTime && (
                    <span className="font-bold text-slate-500 border-b border-slate-100 pb-2 mb-1">
                        {displayTime}
                    </span>
                )}
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color || entry.fill }}
                            ></span>
                            <span className="font-semibold text-slate-700">{entry.name}</span>
                        </div>
                        <span
                            className="font-extrabold"
                            style={{ color: entry.color || entry.fill }}
                        >
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function LiveRequestChart({ isConnected }) {

    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadInitialMetrics() {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/metrics/live`);
            setChartData(response.data.data || []);
        } catch (error) {
            console.error("Error loading initial metrics:", error);
            setError("Failed to load initial metrics");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInitialMetrics();
        if (!socket) return;

        const handleMetrics = (newMetrics) => {
            setChartData((prev) => {
                const filtered = prev.filter(
                    item => item.timestamp !== newMetrics.timestamp
                );

                return [...filtered, newMetrics]
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .slice(-60);
            });
        };

        socket.on("metrics:update", handleMetrics);

        return () => {
            socket.off("metrics:update", handleMetrics);
        };

    }, [socket]);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
                <p className="text-slate-500 font-medium">Loading live metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center h-[500px] text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h3>
                <p className="text-slate-500">{error}</p>
            </div>
        );
    }

    // Extract the most recent data point for the live numeric display
    const latestMetrics = chartData.length > 0
        ? chartData[chartData.length - 1]
        : { totalRequests: 0, successfulRequests: 0, failedRequests: 0 };

    return (
        <div className="bg-white max-w-[1400px] rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        Live Request Metrics
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                        Real-time throughput (requests per second)
                    </p>
                </div>

                <div
                    className={`px-4 py-2 rounded-full border flex items-center gap-2.5 text-sm font-bold shadow-sm transition-colors ${isConnected
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                >
                    <span className="relative flex h-2.5 w-2.5">
                        {isConnected && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                        ></span>
                    </span>
                    {isConnected ? "Live Connection" : "Disconnected"}
                </div>
            </div>

            {/* Live Numeric KPI Row */}
            <div className="grid grid-cols-3 gap-6 mb-10 mx-6">
                <DataCard
                    name="Total"
                    value={latestMetrics.totalRequests}
                    sign="req/sec"
                    logo={<Layers className="text-blue-500" strokeWidth={1.5} />}
                    animate={true}
                />

                <DataCard
                    name="Success"
                    value={latestMetrics.successfulRequests}
                    sign="req/sec"
                    logo={<CheckCircle className="text-green-500" strokeWidth={1.5} />}
                    animate={true}
                />

                <DataCard
                    name="Failed"
                    value={latestMetrics.failedRequests}
                    sign="req/sec"
                    logo={<AlertCircle className="text-red-500" strokeWidth={1.5} />}
                    animate={true}
                />
            </div>

            {/* Chart Area */}
            <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatTime}
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            minTickGap={30}
                        />

                        <YAxis
                            allowDecimals={false}
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />

                        <Legend
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#475569",
                                paddingTop: "20px",
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="totalRequests"
                            name="Total"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            isAnimationActive={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="successfulRequests"
                            name="Success"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={false}
                            isAnimationActive={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="failedRequests"
                            name="Failed"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            strokeDasharray="6 4"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}