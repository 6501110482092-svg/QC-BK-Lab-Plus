import React from 'react';
import { QCResult, QCConfig } from '../types';

interface LJChartProps {
  results: QCResult[];
  config: QCConfig;
  level: 1 | 2 | 3;
}

export default function LJChart({ results, config, level }: LJChartProps) {
  const levelParams = level === 1 ? config.level1 : (level === 2 ? config.level2 : config.level3);
  if (!levelParams) return <div className="text-center py-10 text-slate-300">No parameters defined for Level {level}</div>;
  
  const { mean, sd } = levelParams;
  
  const filteredResults = results
    .filter(r => r.level === level && r.testId === config.id)
    .slice(-30);

  const width = 600;
  const height = 300;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const yMin = mean - 4 * sd;
  const yMax = mean + 4 * sd;
  const getY = (val: number) => padding + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;

  const points = Math.max(10, filteredResults.length);
  const getX = (index: number) => padding + (index / (points - 1)) * chartWidth;

  const yLines = [
    { val: mean + 3 * sd, label: '+3SD', color: '#ef4444' },
    { val: mean + 2 * sd, label: '+2SD', color: '#f59e0b' },
    { val: mean + 1 * sd, label: '+1SD', color: '#cbd5e1' },
    { val: mean, label: 'Mean', color: '#10b981' },
    { val: mean - 1 * sd, label: '-1SD', color: '#cbd5e1' },
    { val: mean - 2 * sd, label: '-2SD', color: '#f59e0b' },
    { val: mean - 3 * sd, label: '-3SD', color: '#ef4444' },
  ];

  return (
    <div className="w-full h-[400px] relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans select-none">
        {/* Y Axis Reference Lines */}
        {yLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <line
              x1={padding}
              y1={getY(line.val)}
              x2={width - padding}
              y2={getY(line.val)}
              stroke={line.color}
              strokeWidth={line.val === mean ? 1.5 : 1}
              strokeDasharray={line.val === mean ? "0" : "4"}
              opacity={line.val === mean ? 0.8 : 0.4}
            />
            <text
              x={padding - 5}
              y={getY(line.val)}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="10"
              fill={line.color}
              className="font-bold font-mono"
            >
              {line.label}
            </text>
          </React.Fragment>
        ))}

        {/* X Axis Date Labels */}
        {filteredResults.map((r, i) => (
          <text
            key={`date-${i}`}
            x={getX(i)}
            y={height - padding + 15}
            textAnchor="middle"
            fontSize="8"
            fill="#94a3b8"
            className="font-bold"
            transform={`rotate(45, ${getX(i)}, ${height - padding + 15})`}
          >
            {new Date(r.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}
          </text>
        ))}

        {/* Connecting Lines */}
        <polyline
          points={filteredResults.map((r, i) => `${getX(i)},${getY(r.value)}`).join(' ')}
          fill="none"
          stroke="#0F4C81"
          strokeWidth="2"
          strokeJoin="round"
          strokeLinecap="round"
        />

        {/* Data Points */}
        {filteredResults.map((result, i) => (
          <g key={result.id}>
            <circle
              cx={getX(i)}
              cy={getY(result.value)}
              r={result.westgardViolations.length > 0 ? "5" : "4"}
              className={result.westgardViolations.length > 0 ? "fill-red-500" : "fill-[#0F4C81]"}
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx={getX(i)}
              cy={getY(result.value)}
              r="10"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>{`Val: ${result.value}\nDate: ${new Date(result.date).toLocaleString('th-TH')}\nBy: ${result.operatorName}`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
