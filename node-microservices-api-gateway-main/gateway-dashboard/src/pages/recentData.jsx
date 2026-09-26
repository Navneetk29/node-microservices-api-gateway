import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DataCard from "../component/dataCard";
import { Layers, CheckCircle, Clock } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const COLORS = [
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
];

const STATUS_COLORS = {
    success: "#10b981", // Emerald
    clientError: "#f59e0b", // Amber
    serverError: "#ef4444", // Red
    gatewayError: "#ec4899", // Pink
};

export default function RecentData() {
    const [activeTab, setActiveTab] = useState("100req"); // '100req' | '5min'

    const [recentHundredData, setRecentHundredData] = useState([]);
    const [recentFiveMinData, setRecentFiveMinData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getDashboardData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                "http://localhost:3000/metrics/recent-req-data",
            );

            // Assuming both arrays are returned in the same response
            if (res?.data?.success || res?.data?.data) {
                setRecentHundredData(res.data.data || []);
                setRecentFiveMinData(res.data.recentFiveMinData || []);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    const timelineData = useMemo(() => {
        return [...recentHundredData]
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((item, index) => ({
                id: `${item.timestamp}-${index}`, // Guaranteed unique key
                timestamp: item.timestamp,
                time: new Date(item.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
                responseTime: item.responseTime,
                serviceName: item.serviceName,
            }));
    }, [recentHundredData]);

    const serviceDistribution = useMemo(() => {
        const counts = recentHundredData.reduce((acc, curr) => {
            acc[curr.serviceName] = (acc[curr.serviceName] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [recentHundredData]);

    const avgResponseTimeData = useMemo(() => {
        const stats = recentHundredData.reduce((acc, curr) => {
            if (!acc[curr.serviceName])
                acc[curr.serviceName] = { totalTime: 0, count: 0 };
            acc[curr.serviceName].totalTime += curr.responseTime;
            acc[curr.serviceName].count += 1;
            return acc;
        }, {});

        return Object.entries(stats).map(([name, data]) => ({
            name,
            avgResponseTime: Math.round(data.totalTime / data.count),
        }));
    }, [recentHundredData]);

    const fiveMinChartData = useMemo(() => {
        return [...recentFiveMinData]
            .sort((a, b) => new Date(a.minuteStamp) - new Date(b.minuteStamp))
            .map((item) => ({
                time: new Date(item.minuteStamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                totalRequests: item.metrics.totalRequests,
                successfulRequests: item.metrics.successfulRequests,
                averageResponseTime: Number(
                    item.metrics.averageResponseTime.toFixed(2),
                ),
                errorRate:
                    item.metrics.clientErrorRate +
                    item.metrics.serverErrorRate +
                    item.metrics.gatewayErrorRate,
            }));
    }, [recentFiveMinData]);

    const fiveMinAggregates = useMemo(() => {
        if (!recentFiveMinData.length)
            return { totalReqs: 0, avgTime: 0, successRate: 0 };

        const totals = recentFiveMinData.reduce(
            (acc, curr) => {
                acc.reqs += curr.metrics.totalRequests;
                acc.success += curr.metrics.successfulRequests;
                acc.time += curr.metrics.averageResponseTime;
                return acc;
            },
            { reqs: 0, success: 0, time: 0 },
        );

        return {
            totalReqs: totals.reqs,
            successRate: totals.reqs
                ? ((totals.success / totals.reqs) * 100).toFixed(1)
                : 0,
            avgTime: (totals.time / recentFiveMinData.length).toFixed(1),
        };
    }, [recentFiveMinData]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            // Grab the formatted time directly from the hovered data point
            const displayTime = payload[0].payload.time;

            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col gap-1 text-sm z-50">
                    <span className="font-bold text-slate-500 mb-1">{displayTime}</span>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color || entry.fill }}
                            ></span>
                            <span className="font-semibold text-slate-700 capitalize">
                                {entry.name}:
                            </span>
                            <span
                                className="font-bold"
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

    return (
        <>
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Metrics Overview
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">
                            Monitor your gateway traffic and performance
                        </p>
                    </div>

                    <div className="bg-slate-200/60 p-1 rounded-xl flex items-center shadow-inner">
                        <button
                            onClick={() => setActiveTab("100req")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "100req"
                                    ? "bg-white text-cyan-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Recent 100 Requests
                        </button>
                        <button
                            onClick={() => setActiveTab("5min")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "5min"
                                    ? "bg-white text-cyan-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Past 5 Minutes
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === "100req" &&
                            (recentHundredData.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-medium">
                                    No recent requests found.
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 lg:col-span-2">
                                            <h3 className="text-lg font-extrabold text-slate-800 mb-6">
                                                Response Time Trend (ms)
                                            </h3>
                                            <div className="h-72 w-full">
                                                <ResponsiveContainer>
                                                    <LineChart
                                                        data={timelineData}
                                                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            stroke="#f1f5f9"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="id"
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            minTickGap={30}
                                                            tickFormatter={(value) => {
                                                                // Extract the original timestamp from the ID and format it for the axis
                                                                const rawTimestamp = parseInt(
                                                                    value.split("-")[0],
                                                                );
                                                                return new Date(
                                                                    rawTimestamp,
                                                                ).toLocaleTimeString([], {
                                                                    hour12: false,
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    second: "2-digit",
                                                                });
                                                            }}
                                                        />
                                                        <YAxis
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <Tooltip
                                                            content={<CustomTooltip />}
                                                            cursor={{
                                                                stroke: "#cbd5e1",
                                                                strokeWidth: 1,
                                                                strokeDasharray: "4 4",
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="responseTime"
                                                            name="Response Time"
                                                            stroke="#06b6d4"
                                                            strokeWidth={2}
                                                            dot={false}
                                                            activeDot={{
                                                                r: 6,
                                                                fill: "#06b6d4",
                                                                stroke: "#fff",
                                                                strokeWidth: 2,
                                                            }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                            <h3 className="text-lg font-extrabold text-slate-800 mb-6">
                                                Requests by Service
                                            </h3>
                                            <div className="h-72 w-full flex items-center justify-center">
                                                <ResponsiveContainer>
                                                    <PieChart>
                                                        <Pie
                                                            data={serviceDistribution}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={90}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {serviceDistribution.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend
                                                            iconType="circle"
                                                            wrapperStyle={{
                                                                fontSize: "13px",
                                                                fontWeight: "600",
                                                                color: "#475569",
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                            <h3 className="text-lg font-extrabold text-slate-800 mb-6">
                                                Avg Response Time by Service (ms)
                                            </h3>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer>
                                                    <BarChart
                                                        data={avgResponseTimeData}
                                                        margin={{
                                                            top: 10,
                                                            right: 10,
                                                            left: -20,
                                                            bottom: 0,
                                                        }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            stroke="#f1f5f9"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="name"
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <YAxis
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <Tooltip
                                                            content={<CustomTooltip />}
                                                            cursor={{ fill: "#f8fafc" }}
                                                        />
                                                        <Bar
                                                            dataKey="avgResponseTime"
                                                            name="Avg Time"
                                                            radius={[6, 6, 0, 0]}
                                                        >
                                                            {avgResponseTimeData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100">
                                            <h3 className="text-lg font-extrabold text-slate-800">
                                                Recent Logs Detailed View
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                                        <th className="px-6 py-4 font-bold">Timestamp</th>
                                                        <th className="px-6 py-4 font-bold">Service</th>
                                                        <th className="px-6 py-4 font-bold">Instance ID</th>
                                                        <th className="px-6 py-4 font-bold">Status</th>
                                                        <th className="px-6 py-4 font-bold">
                                                            Response Time
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-sm">
                                                    {recentHundredData.map((req, index) => (
                                                        <tr
                                                            key={index}
                                                            className="hover:bg-slate-50/80 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                                {new Date(req.timestamp).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 font-semibold text-slate-700 capitalize">
                                                                {req.serviceName}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                                {req.instanceId}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className="px-2.5 py-1 rounded-full text-xs font-bold capitalize border"
                                                                    style={{
                                                                        backgroundColor: `${STATUS_COLORS[req.category]}15`,
                                                                        color: STATUS_COLORS[req.category],
                                                                        borderColor: `${STATUS_COLORS[req.category]}30`,
                                                                    }}
                                                                >
                                                                    {req.statusCode} •{" "}
                                                                    {req.category.replace("Error", " Error")}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                                                                {req.responseTime} ms
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {activeTab === "5min" &&
                            (recentFiveMinData.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-medium">
                                    No 5-minute aggregated data found.
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Traffic (5m)</p>
                                                <h4 className="text-2xl font-extrabold text-slate-800"> <span className="text-sm text-slate-500 font-medium">reqs</span></h4>
                                            </div>
                                        </div> */}

                                        <DataCard
                                            name="Total Traffic (5m)"
                                            value={fiveMinAggregates.totalReqs}
                                            sign="req"
                                            logo={
                                                <Layers className="text-blue-500" strokeWidth={1.5} />
                                            }
                                        />
                                        <DataCard
                                            name="Avg Success Rate"
                                            value={fiveMinAggregates.successRate}
                                            sign="%"
                                            logo={
                                                <CheckCircle
                                                    className="text-green-500"
                                                    strokeWidth={1.5}
                                                />
                                            }
                                        />
                                        <DataCard
                                            name="Avg Response Time"
                                            value={fiveMinAggregates.avgTime}
                                            sign="ms"
                                            logo={
                                                <Clock className="text-blue-500" strokeWidth={1.5} />
                                            }
                                        />

                                        {/* <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Success Rate</p>
                                                <h4 className="text-2xl font-extrabold text-slate-800">{fiveMinAggregates.successRate}%</h4>
                                            </div>
                                        </div> */}

                                        {/* <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Response</p>
                                                <h4 className="text-2xl font-extrabold text-slate-800">{fiveMinAggregates.avgTime} <span className="text-sm text-slate-500 font-medium">ms</span></h4>
                                            </div>
                                        </div> */}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                            <h3 className="text-lg font-extrabold text-slate-800 mb-6">
                                                Traffic Volume (Minute by Minute)
                                            </h3>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer>
                                                    <AreaChart
                                                        data={fiveMinChartData}
                                                        margin={{
                                                            top: 10,
                                                            right: 10,
                                                            left: -20,
                                                            bottom: 0,
                                                        }}
                                                    >
                                                        <defs>
                                                            <linearGradient
                                                                id="colorTotal"
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor="#06b6d4"
                                                                    stopOpacity={0.3}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="#06b6d4"
                                                                    stopOpacity={0}
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            stroke="#f1f5f9"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="time"
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <YAxis
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="totalRequests"
                                                            name="Total Requests"
                                                            stroke="#06b6d4"
                                                            strokeWidth={3}
                                                            fillOpacity={1}
                                                            fill="url(#colorTotal)"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                            <h3 className="text-lg font-extrabold text-slate-800 mb-6">
                                                Average Response Time
                                            </h3>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer>
                                                    <LineChart
                                                        data={fiveMinChartData}
                                                        margin={{
                                                            top: 10,
                                                            right: 10,
                                                            left: -20,
                                                            bottom: 0,
                                                        }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            stroke="#f1f5f9"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="time"
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <YAxis
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="averageResponseTime"
                                                            name="Avg Time (ms)"
                                                            stroke="#8b5cf6"
                                                            strokeWidth={3}
                                                            dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                                                            activeDot={{
                                                                r: 6,
                                                                stroke: "#fff",
                                                                strokeWidth: 2,
                                                            }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100">
                                            <h3 className="text-lg font-extrabold text-slate-800">
                                                5-Minute Aggregation Details
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                                        <th className="px-6 py-4 font-bold">
                                                            Minute (UTC)
                                                        </th>
                                                        <th className="px-6 py-4 font-bold">Total Reqs</th>
                                                        <th className="px-6 py-4 font-bold">
                                                            Success Rate
                                                        </th>
                                                        <th className="px-6 py-4 font-bold">
                                                            Client Errors
                                                        </th>
                                                        <th className="px-6 py-4 font-bold">
                                                            Server Errors
                                                        </th>
                                                        <th className="px-6 py-4 font-bold">Avg Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-sm">
                                                    {recentFiveMinData.map((minuteData, index) => (
                                                        <tr
                                                            key={index}
                                                            className="hover:bg-slate-50/80 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium">
                                                                {new Date(
                                                                    minuteData.minuteStamp,
                                                                ).toLocaleTimeString()}
                                                            </td>
                                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                                {minuteData.metrics.totalRequests}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${minuteData.metrics.successRate > 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                                                >
                                                                    {minuteData.metrics.successRate.toFixed(1)}%
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                                {minuteData.metrics.clientErrors}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span
                                                                    className={
                                                                        minuteData.metrics.serverErrors > 0
                                                                            ? "text-rose-500 font-bold"
                                                                            : "text-slate-600 font-medium"
                                                                    }
                                                                >
                                                                    {minuteData.metrics.serverErrors}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono font-semibold text-cyan-600">
                                                                {minuteData.metrics.averageResponseTime.toFixed(
                                                                    2,
                                                                )}{" "}
                                                                ms
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </>
                )}
            </div>
        </div>
        
        </>
    );
}
