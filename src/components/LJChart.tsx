import React from 'react';
import { QCResult, QCConfig } from '../types';

interface LJChartProps {
  results: QCResult[];
  config: QCConfig;
  level: 1 | 2 | 3;
  instrumentId: string;
}

export default function LJChart({ results, config, level, instrumentId }: LJChartProps) {
  const levelParams = level === 1 ? config.level1 : (level === 2 ? config.level2 : config.level3);
  if (!levelParams) return <div className="text-center py-10 text-slate-300">No parameters defined for Level {level}</div>;
  
  const mean = levelParams.mean;
  const sd = levelParams.sd || 0.0001; // Avoid division by zero if SD is 0
  
  const filteredResults = results
    .filter(r => r.level === level && r.testId === config.id && r.instrumentId === instrumentId);

  const width = 800;
  const height = 420;
  const paddingLeft = 100;
  const paddingRight = 60;
  const paddingTop = 40;
  const paddingBottom = 60;
  
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  const dataMax = Math.max(...filteredResults.map(r => r.value), mean + 3.1 * sd);
  const dataMin = Math.min(...filteredResults.map(r => r.value), mean - 3.1 * sd);
  const rangeSpread = Math.max(dataMax - dataMin, 0.0001);
  const yMax = mean + (rangeSpread / 2) * 1.25;
  const yMin = mean - (rangeSpread / 2) * 1.25;

  const getY = (val: number) => {
    const range = (yMax - yMin) || 0.0001;
    const rawY = paddingTop + (chartHeight * (yMax - val)) / range;
    return rawY;
  };

  const pointsCount = Math.max(10, filteredResults.length);
  const getX = (index: number) => {
    const divider = pointsCount > 1 ? pointsCount - 1 : 1;
    return paddingLeft + (index / divider) * chartWidth;
  };

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
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-sans select-none overflow-visible">
        {/* Y Axis Reference Lines */}
        {yLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <line
              x1={paddingLeft}
              y1={getY(line.val)}
              x2={width - paddingRight}
              y2={getY(line.val)}
              stroke={line.color}
              strokeWidth={line.val === mean ? 1.5 : 1}
              strokeDasharray={line.val === mean ? "0" : "4"}
              opacity={line.val === mean ? 0.8 : 0.4}
            />
            <text
              x={paddingLeft - 12}
              y={getY(line.val)}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="12"
              fill={line.color}
              className="font-black font-mono"
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
            y={height - paddingBottom + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
            className="font-black"
            transform={`rotate(45, ${getX(i)}, ${height - paddingBottom + 20})`}
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
