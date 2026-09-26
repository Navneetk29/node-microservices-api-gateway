import LiveRequestChart from "../component/liveRequestChart"; 
import LiveSyatemInfo from "../component/liveSystemInfoChart";
import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { socket } from '../web-socket'




export default function LiveData() {

    const [isConnected, setIsConnected] = useState(socket.connected);


    useEffect(() => {
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handleError = () => setIsConnected(false);

        setIsConnected(socket.connected);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleError);
        };
    }, []);
    return (
        <div className="min-h-screen bg-slate-50 p-8 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Real-Time Monitor
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">
                        Watch incoming traffic, success rates, and errors as they happen across your gateway.
                    </p>
                </div>


                <LiveRequestChart
                    isConnected={isConnected}
                />

                <LiveSyatemInfo/>

            </div>
        </div>
    );
}