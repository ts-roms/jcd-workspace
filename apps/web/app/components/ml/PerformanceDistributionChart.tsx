'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface PerformanceDistributionChartProps {
  data: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
}

export function PerformanceDistributionChart({
  data,
}: PerformanceDistributionChartProps) {
  const chartData = [
    { name: 'Excellent', value: data.excellent, color: '#22c55e' },
    { name: 'Good', value: data.good, color: '#3b82f6' },
    { name: 'Average', value: data.average, color: '#eab308' },
    { name: 'Below Average', value: data.belowAverage, color: '#f97316' },
    { name: 'Poor', value: data.poor, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">Count: {payload[0].value}</p>
          <p className="text-sm text-muted-foreground">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Don't show label if too small

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution of predicted performance categories
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Predictions</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Average Rating</p>
            <p className="text-2xl font-bold">
              {total > 0
                ? (
                    (data.excellent * 5 +
                      data.good * 4 +
                      data.average * 3 +
                      data.belowAverage * 2 +
                      data.poor * 1) /
                    total
                  ).toFixed(2)
                : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
