import React, { useState } from "react";
import { 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    ResponsiveContainer, 
    Legend, 
    Sector 
} from "recharts";

// A vibrant, modern color palette
const COLORS = [
    "#06b6d4", // Cyan
    "#8b5cf6", // Violet
    "#f43f5e", // Rose
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#3b82f6", // Blue
    "#ec4899"  // Pink
];

// Custom Tooltip for a sleek hover effect
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col gap-1 min-w-[120px] transition-all">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {payload[0].name}
                </span>
                <span className="text-2xl font-extrabold" style={{ color: payload[0].payload.fill }}>
                    {payload[0].value} %
                </span>
            </div>
        );
    }
    return null;
};

// Custom shape to slightly expand the segment when hovered
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8} // Expands outward by 8px on hover
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0px 0px 8px ${fill}60)` }} // Adds a soft glow
            />
        </g>
    );
};

export default function DonutChartCard({ 
    heading = "Data Overview", 
    dataObj = {} 
}) {
    const [activeIndex, setActiveIndex] = useState(null);

    const data = Object.entries(dataObj).map(([key, value]) => ({
        name: key,
        value: value
    }));

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 font-sans">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                </div>
                {heading}
            </h2>

            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 font-medium">No data available to display.</p>
                </div>
            ) : (
                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={75} // Creates the "donut" hole
                                outerRadius={100} // Outer edge thickness
                                paddingAngle={4} // Gap between slices
                                minAngle={5} // <--- ADDED THIS: Forces tiny values to be visible
                                dataKey="value"
                                stroke="none"
                                animationDuration={1000} // Smooth load-in animation
                                animationEasing="ease-out"
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                            >
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]} 
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Legend 
                                iconType="circle"
                                wrapperStyle={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}