// export default function DataCard({ name, value, sign = "", logo, animate = false }) {
//     // Check both conditions: the prop is true, and the value is greater than 0
//     const shouldAnimate = animate && Number(value) > 0;

//     return (
//         <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
//             {/* Decorative background blob */}
//             <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-50"></div>
            
//             {/* Logo container */}
//             {logo && (
//                 <div 
//                     className={`absolute right-5 top-5 text-blue-500 [&>svg]:h-7 [&>svg]:w-7 transition-all duration-300 ${
//                         shouldAnimate ? "animate-pulse drop-shadow-md" : ""
//                     }`}
//                 >
//                     {logo}
//                 </div>
//             )}

//             <div className="relative z-10">
//                 <p className="truncate text-sm font-medium text-slate-600">
//                     {name}
//                 </p>
//                 <div className="mt-2 flex items-baseline gap-1">
//                     <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
//                         {value}
//                     </h3>
//                     {sign && (
//                         <span className="text-xl font-medium text-slate-600">
//                             {sign}
//                         </span>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }



// export default function DataCard({ name, value, sign = "", logo, animate = false }) {
//     // Strip commas from the localized string before converting to a number
//     const numericValue = Number(String(value).replace(/,/g, ""));
//     const shouldAnimate = animate && numericValue > 0;

//     return (
//         <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            
//             <style>
//                 {`
//                     @keyframes breathe {
//                         0%, 100% { transform: scale(1); opacity: 1; }
//                         50% { transform: scale(1.1); opacity: 0.6; }
//                     }
//                     .animate-breathe {
//                         animation: breathe 2s ease-in-out infinite;
//                     }
//                 `}
//             </style>

//             <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-50"></div>
            
//             {/* Logo container */}
//             {logo && (
//                 <div 
//                     className={`absolute right-5 top-5 text-blue-500 [&>svg]:h-7 [&>svg]:w-7 transition-all duration-300 ${
//                         shouldAnimate ? "animate-breathe drop-shadow-md" : ""
//                     }`}
//                 >
//                     {logo}
//                 </div>
//             )}

//             {/* Content */}
//             <div className="relative z-10">
//                 <p className="truncate text-sm font-medium text-slate-600">
//                     {name}
//                 </p>
//                 <div className="mt-2 flex items-baseline gap-1">
//                     <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
//                         {value}
//                     </h3>
//                     {sign && (
//                         <span className="text-xl font-medium text-slate-600">
//                             {sign}
//                         </span>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


export default function DataCard({ name, value, sign = "", logo, animate = false }) {
    // Strip commas from the localized string before converting to a number
    const numericValue = Number(String(value).replace(/,/g, ""));
    const shouldAnimate = animate && numericValue > 0;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            
            {/* Injecting custom animations for Breathe and Wave effects */}
            <style>
                {`
                    @keyframes breathe {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                    }
                    .animate-breathe {
                        animation: breathe 2s ease-in-out infinite;
                    }

                    @keyframes wave {
                        0% { transform: scale(0.6); opacity: 0.8; }
                        100% { transform: scale(3); opacity: 0; }
                    }
                    .animate-wave {
                        animation: wave 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                    .animate-wave-delayed {
                        animation: wave 2s cubic-bezier(0, 0, 0.2, 1) 1s infinite;
                    }
                `}
            </style>

            {/* Decorative background blob */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-50"></div>
            
            {/* Logo & Wave Container */}
            {logo && (
                <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center">
                    
                    {/* Expanding Rings (Only show when animating) */}
                    {shouldAnimate && (
                        <>
                            <div className="absolute h-10 w-10 rounded-full border-2 border-blue-300 bg-blue-100/30 animate-wave pointer-events-none"></div>
                            <div className="absolute h-10 w-10 rounded-full border-2 border-blue-300 bg-blue-100/20 animate-wave-delayed pointer-events-none"></div>
                        </>
                    )}
                    
                    {/* The Logo itself */}
                    <div 
                        className={`relative z-10 text-blue-500 [&>svg]:h-7 [&>svg]:w-7 transition-all duration-300 ${
                            shouldAnimate ? "animate-breathe drop-shadow-md" : ""
                        }`}
                    >
                        {logo}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                <p className="truncate text-sm font-medium text-slate-600">
                    {name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                    <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                        {value}
                    </h3>
                    {sign && (
                        <span className="text-xl font-medium text-slate-600">
                            {sign}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}