import React from 'react';
import type { ChartDataPoint } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function SimpleBarChart({ data, height = 160 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((point, i) => {
          const incomeH = maxValue > 0 ? (point.income / maxValue) * (height - 32) : 0;
          const expenseH = maxValue > 0 ? (point.expense / maxValue) * (height - 32) : 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: height - 24 }}>
                {/* Income bar */}
                <div
                  className="w-[45%] bg-[#AADD00] border border-black rounded-t-sm transition-all"
                  style={{ height: Math.max(incomeH, 2) }}
                />
                {/* Expense bar */}
                <div
                  className="w-[45%] bg-[#FF4D8D] border border-black rounded-t-sm transition-all"
                  style={{ height: Math.max(expenseH, 2) }}
                />
              </div>
              <span className="text-[10px] font-semibold text-[#666]">{point.label}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#AADD00] border border-black rounded-sm" />
          <span className="text-xs font-semibold text-[#666]">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#FF4D8D] border border-black rounded-sm" />
          <span className="text-xs font-semibold text-[#666]">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}

interface SimplePieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function SimplePieChart({ data, size = 120 }: SimplePieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;

  const segments = data.map((item) => {
    const pct = item.value / total;
    const startAngle = cumulative * 360;
    const endAngle = (cumulative + pct) * 360;
    cumulative += pct;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const r = size / 2 - 2;
    const cx = size / 2;
    const cy = size / 2;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = pct > 0.5 ? 1 : 0;

    return {
      ...item,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      pct: Math.round(pct * 100),
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="flex-shrink-0">
        {segments.map((seg, i) => (
          <path key={i} d={seg.path} fill={seg.color} stroke="white" strokeWidth="2" />
        ))}
        {/* Center circle */}
        <circle cx={size / 2} cy={size / 2} r={size / 4} fill="white" stroke="#111" strokeWidth="2" />
      </svg>
      {/* Legend */}
      <div className="flex-1 space-y-1.5">
        {segments.slice(0, 5).map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-[#444] flex-1 truncate">{seg.label}</span>
            <span className="text-xs font-bold text-[#111]">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimpleBarChart;
