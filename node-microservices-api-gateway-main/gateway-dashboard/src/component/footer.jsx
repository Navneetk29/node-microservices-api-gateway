import { socket } from "../web-socket";
import { useState } from "react";

export default function Footer() {

    const [isConnected, setIsConnected] = useState(socket.connected);

    return (
        <footer className="border-t border-slate-200 bg-white mt-auto">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    <div className="text-center md:text-left">
                        <p className="text-sm font-medium text-slate-500">
                            © {new Date().getFullYear()} Gateway Dashboard. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">

                        <nav className="flex items-center gap-6">
                            <a
                                href="#"
                                className="text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"
                            >
                                Documentation
                            </a>
                            <a
                                href="#"
                                className="text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"
                            >
                                API Support
                            </a>
                        </nav>

                        {/* <div className="flex items-center gap-2 sm:pl-6 sm:border-l border-slate-200">

                            <span className="relative flex h-2.5 w-2.5">
                                {isConnected && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span
                                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? "bg-emerald-500" : "bg-rose-500"
                                        }`}
                                ></span>
                            </span>
                            <span className="text-sm font-extrabold text-slate-700 tracking-tight">
                                {isConnected ? "System Operational" : "Disconnected"}
                            </span>


                        </div> */}

                    </div>


                </div>
            </div>
        </footer>
    );
}