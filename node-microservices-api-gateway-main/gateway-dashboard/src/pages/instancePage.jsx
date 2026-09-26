import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DataCard from "../component/dataCard";
import {
    Server,
    Layers,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    AlertTriangle,
    UserX,
    ServerCrash,
    Unplug,
    Timer,
} from "lucide-react";

export default function ServiceInstances() {
    const { serviceName } = useParams();
    const navigate = useNavigate();
    const [instanceData, setInstanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getInstanceData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:3000/metrics/service/${serviceName}/instances`,
            );
            setInstanceData(res.data.data.instances || []);
        } catch (err) {
            setError("Failed to fetch instance metrics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (serviceName) {
            getInstanceData();
        }
    }, [serviceName]);

    const totalRequests = instanceData.reduce(
        (total, instance) => total + (instance.totalRequests || 0),
        0,
    );

    const totalSuccessful = instanceData.reduce(
        (total, instance) => total + (instance.successfulRequests || 0),
        0,
    );

    const totalFailed = instanceData.reduce(
        (total, instance) => total + (instance.failedRequests || 0),
        0,
    );

    const totalClientErrors = instanceData.reduce(
        (total, instance) => total + (instance.clientErrors || 0),
        0,
    );

    const totalServerErrors = instanceData.reduce(
        (total, instance) => total + (instance.serverErrors || 0),
        0,
    );

    const totalGatewayErrors = instanceData.reduce(
        (total, instance) => total + (instance.gatewayErrors || 0),
        0,
    );

    const totalTimeouts = instanceData.reduce(
        (total, instance) => total + (instance.timeoutRequests || 0),
        0,
    );

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
                        onClick={getInstanceData}
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                Service Metrics
                            </span>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Active
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold capitalize tracking-tight text-slate-900">
                            {serviceName}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                        Back to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <DataCard
                        name="Total Instances"
                        value={instanceData.length}
                        logo={<Server className="text-blue-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Total Requests"
                        value={totalRequests.toLocaleString()}
                        logo={<Layers className="text-blue-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Successful Requests"
                        value={totalSuccessful.toLocaleString()}
                        logo={<CheckCircle className="text-green-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Failed Requests"
                        value={totalFailed.toLocaleString()}
                        logo={<AlertCircle className="text-red-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Client Errors (4xx)"
                        value={totalClientErrors.toLocaleString()}
                        logo={<UserX className="text-orange-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Server Errors (5xx)"
                        value={totalServerErrors.toLocaleString()}
                        logo={<ServerCrash className="text-red-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Gateway Errors"
                        value={totalGatewayErrors.toLocaleString()}
                        logo={<Unplug className="text-purple-500" strokeWidth={1.5} />}
                    />
                    <DataCard
                        name="Timeout Requests"
                        value={totalTimeouts.toLocaleString()}
                        logo={<Timer className="text-amber-500" strokeWidth={1.5} />}
                    />
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-5">
                        <h2 className="text-base font-semibold leading-6 text-slate-900">
                            Instance Details
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Instance ID
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
                                        Failure Rate
                                    </th>
                                    <th
                                        scope="col"
                                        className="whitespace-nowrap py-3.5 pl-3 pr-6 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        Avg Response
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {instanceData.map((instance) => (
                                    <tr
                                        key={instance.instanceId}
                                        className="transition-colors hover:bg-slate-50/75"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-center">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex h-3 w-3 items-center justify-center">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-20"></span>
                                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                                </div>
                                                <span className="font-medium text-slate-900">
                                                    {instance.instanceId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-slate-900">
                                            {instance.totalRequests?.toLocaleString() ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-green-600">
                                            {instance.successfulRequests?.toLocaleString() ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-orange-600">
                                            {instance.clientErrors?.toLocaleString() ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-red-600">
                                            {instance.serverErrors?.toLocaleString() ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-purple-600">
                                            {instance.gatewayErrors?.toLocaleString() ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-amber-600">
                                            {instance.timeoutRequests?.toLocaleString() ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                                                        style={{ width: `${instance.successRate || 0}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-center font-medium text-slate-700">
                                                    {instance.successRate || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${(instance.failureRate || 0) > 5
                                                        ? "bg-red-50 text-red-700 ring-red-600/10"
                                                        : "bg-slate-50 text-slate-600 ring-slate-500/10"
                                                    }`}
                                            >
                                                {instance.failureRate || 0}%
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-3 pr-6 text-center text-sm font-medium text-slate-600">
                                            {instance.averageResponseTime || 0} ms
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
