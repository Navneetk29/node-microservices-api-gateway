import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataCard from "../component/dataCard";
import DonutChartCard from "../component/donutChartCard";
import {
    Layers,
    CheckCircle,
    AlertTriangle,
    ShieldCheck,
    Clock,
    ArrowRight,
    UserX,
    ServerCrash,
    Unplug,
    Timer,
} from "lucide-react";

export default function Home() {
    const navigate = useNavigate();
    const [metricsData, setMetricsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getGlobalData = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:3000/metrics");
            setMetricsData(res.data.data);
            setError("");
        } catch (err) {
            setError("Failed to fetch global metrics");
        } finally {
            setLoading(false);
        }
    };
  
    const requestRateData = {
        "success Rate": metricsData?.global?.successRate || 0,
        "client Error Rate": metricsData?.global?.clientErrorRate || 0,
        "server Error Rate": metricsData?.global?.serverErrorRate || 0,
        "gateway Error Rate": metricsData?.global?.gatewayErrorRate || 0,
        "timeout Rate": metricsData?.global?.timeoutRate || 0,
    }
        
    useEffect(() => {
        getGlobalData();
    }, []);

    const global = metricsData.global;
    const services = metricsData.services || {};

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                    <p className="text-sm font-medium tracking-wide text-slate-500">
                        Loading metrics...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-red-100">
                    <AlertTriangle
                        className="mx-auto mb-4 h-12 w-12 text-red-500"
                        strokeWidth={2}
                    />
                    <h3 className="mb-2 text-lg font-semibold text-slate-800">
                        Connection Error
                    </h3>
                    <p className="mb-6 text-sm text-slate-500">{error}</p>
                    <button
                        onClick={getGlobalData}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 md:p-12">
            <div className="mx-auto max-w-[1400px] space-y-8">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                            System Dashboard
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Live
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Global Metrics
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <DataCard
                        name="Total Requests"
                        value={global?.totalRequests?.toLocaleString() ?? 0}
                        logo={<Layers className="text-blue-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Successful Requests"
                        value={global?.successfulRequests?.toLocaleString() ?? 0}
                        logo={<CheckCircle className="text-green-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Success Rate"
                        value={global?.successRate ?? 0}
                        sign="%"
                        logo={<ShieldCheck className="text-green-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Avg Response Time"
                        value={global?.averageResponseTime ?? 0}
                        sign="ms"
                        logo={<Clock className="text-blue-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Client Errors (4xx)"
                        value={global?.clientErrors?.toLocaleString() ?? 0}
                        logo={<UserX className="text-orange-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Server Errors (5xx)"
                        value={global?.serverErrors?.toLocaleString() ?? 0}
                        logo={<ServerCrash className="text-red-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Gateway Errors"
                        value={global?.gatewayErrors?.toLocaleString() ?? 0}
                        logo={<Unplug className="text-purple-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Timeout Requests"
                        value={global?.timeoutRequests?.toLocaleString() ?? 0}
                        logo={<Timer className="text-amber-500" strokeWidth={1.5} />}
                    />
                </div>

                <div className="bg-slate-50">
                    <DonutChartCard 
                        heading="Request Rates" 
                        dataObj={requestRateData} 
                    />
                </div>

                <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-5">
                        <h2 className="text-base font-semibold leading-6 text-slate-900">
                            Active Services
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            {Object.keys(services).length} Services
                        </span>
                    </div>

                    

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-6 pr-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Service
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Total
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Success
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Client Err
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Server Err
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Gateway Err
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Timeouts
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 ml-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Success Rate
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Avg Response
                                    </th>
                                    <th
                                        scope="col"
                                        className="relative whitespace-nowrap py-3.5 pl-3 pr-6 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {Object.entries(services).map(([serviceName, service]) => (
                                    <tr
                                        key={serviceName}
                                        className="transition-colors hover:bg-slate-50/75"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 ring-1 ring-inset ring-blue-600/10">
                                                    {serviceName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold capitalize text-slate-900">
                                                    {serviceName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-slate-900">
                                            {service.totalRequests.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-green-600">
                                            {service.successfulRequests.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-orange-600">
                                            {service.clientErrors.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-red-600">
                                            {service.serverErrors.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-purple-600">
                                            {service.gatewayErrors.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-amber-600">
                                            {service.timeoutRequests.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                                                        style={{ width: `${service.successRate}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-center font-medium text-slate-700">
                                                    {service.successRate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-slate-600">
                                            {service.averageResponseTime} ms
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-3 pr-6 text-center text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    navigate(`/home/service/${serviceName}/instances`)
                                                }
                                                className="group inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700"
                                            >
                                                Details
                                                <ArrowRight
                                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    strokeWidth={2}
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
