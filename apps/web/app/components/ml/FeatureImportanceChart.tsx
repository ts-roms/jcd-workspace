'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { FeatureImportance } from '@/types/ml.types';

interface FeatureImportanceChartProps {
  data: FeatureImportance[];
  maxFeatures?: number;
}

export function FeatureImportanceChart({
  data,
  maxFeatures = 10,
}: FeatureImportanceChartProps) {
  const sortedData = [...data]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxFeatures)
    .map((item) => ({
      ...item,
      // Convert importance to percentage
      importance: item.importance * 100,
    }));

  const getBarColor = (index: number) => {
    const colors = [
      '#3b82f6', // blue
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#a855f7', // purple
      '#d946ef', // fuchsia
      '#ec4899', // pink
      '#f43f5e', // rose
      '#ef4444', // red
      '#f97316', // orange
      '#f59e0b', // amber
    ];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Importance: {payload[0].value.toFixed(2)}%
          </p>
          {payload[0].payload.trend && (
            <p className="text-xs text-muted-foreground capitalize">
              Trend: {payload[0].payload.trend}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Importance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top {maxFeatures} features influencing performance predictions
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
