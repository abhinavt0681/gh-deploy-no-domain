'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';

export interface TimeSeriesDataPoint {
  year: number;
  value: number;
}

export interface TimeSeriesData {
  location: string;
  metric: string;
  unit: string;
  data: TimeSeriesDataPoint[];
}

export interface AnalyticsData {
  primary: TimeSeriesData;
  comparisons: TimeSeriesData[];
  metadata: Record<string, any>;
}

// Inflation rate data by year
const INFLATION_DATA: Record<number, number> = {
  1995: 2.50,
  1996: 3.30,
  1997: 1.70,
  1998: 1.60,
  1999: 2.70,
  2000: 3.40,
  2001: 1.60,
  2002: 2.40,
  2003: 1.90,
  2004: 3.30,
  2005: 3.40,
  2006: 2.50,
  2007: 4.10,
  2008: 0.10,
  2009: 2.70,
  2010: 1.50,
  2011: 3.00,
  2012: 1.70,
  2013: 1.50,
  2014: 0.80,
  2015: 0.70,
  2016: 2.10,
  2017: 2.10,
  2018: 1.90,
  2019: 2.30,
  2020: 1.40,
  2021: 7.00,
  2022: 6.50,
  2023: 3.40,
  2024: 2.90
};

// Chart type options
export type ChartType = 'line' | 'bar' | 'area' | 'yoy';

interface AnalyticsChartProps {
  data: AnalyticsData;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

// Color palette for multiple lines
const CHART_COLORS = [
  '#0284c7',  // blue
  '#7c3aed',  // purple
  '#10b981',  // green
  '#ef4444',  // red
  '#f97316',  // orange
  '#8b5cf6',  // violet
  '#f59e0b',  // amber
  '#14b8a6',  // teal
  '#ec4899',  // pink
  '#6366f1'   // indigo
];

// YoY calculation helper
const calculateYoY = (data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] => {
  return data
    .map((point, index) => {
      if (index === 0) return null; // No previous year for first point
      
      const prevValue = data[index - 1].value;
      if (prevValue === 0) return null; // Avoid division by zero
      
      const percentChange = ((point.value - prevValue) / prevValue) * 100;
      return {
        year: point.year,
        value: parseFloat(percentChange.toFixed(2))
      };
    })
    .filter(Boolean) as TimeSeriesDataPoint[]; // Remove null entries
};

const AnalyticsChart = ({ data, chartType = 'line', onChartTypeChange }: AnalyticsChartProps) => {
  const [showInflation, setShowInflation] = useState(false);
  
  // Transform data for Recharts
  const chartData = data.primary.data.map(point => {
    const dataPoint: Record<string, any> = {
      year: point.year,
      [data.primary.location]: point.value,
      ...(showInflation && INFLATION_DATA[point.year] !== undefined 
        ? { inflation: INFLATION_DATA[point.year] } 
        : {})
    };
    
    // Add comparisons data if available
    if (data.comparisons && data.comparisons.length > 0) {
      data.comparisons.forEach(comparison => {
        const comparisonPoint = comparison.data.find(p => p.year === point.year);
        if (comparisonPoint) {
          dataPoint[comparison.location] = comparisonPoint.value;
        }
      });
    }
    
    return dataPoint;
  });
  
  // For YoY calculations
  let yoyData: any[] = [];
  if (chartType === 'yoy') {
    // Calculate YoY for primary
    const primaryYoY = calculateYoY(data.primary.data);
    
    yoyData = primaryYoY.map(point => {
      const dataPoint: Record<string, any> = {
        year: point.year,
        [`${data.primary.location} YoY`]: point.value,
        ...(showInflation && INFLATION_DATA[point.year] !== undefined 
            ? { inflation: INFLATION_DATA[point.year] } 
            : {})
      };
      
      // Add YoY for comparisons
      if (data.comparisons && data.comparisons.length > 0) {
        data.comparisons.forEach(comparison => {
          const comparisonYoY = calculateYoY(comparison.data);
          const yoyPoint = comparisonYoY.find(p => p.year === point.year);
          if (yoyPoint) {
            dataPoint[`${comparison.location} YoY`] = yoyPoint.value;
          }
        });
      }
      
      return dataPoint;
    });
  }
  
  // Format value for tooltip
  const formatValue = (value: string | number | (string | number)[]) => {
    if (typeof value === 'number') {
      // For YoY charts, always format as percentage
      if (chartType === 'yoy') {
        return `${value.toLocaleString()}%`;
      }
      // For other charts, use appropriate formatting based on unit
      else if (data.primary.unit === 'dollars') {
        return `$${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    return value;
  };
  
  // Helper for downloading CSV
  const downloadCSV = () => {
    // Headers for CSV
    const headers = ['year', data.primary.location];
    if (data.comparisons && data.comparisons.length > 0) {
      data.comparisons.forEach(comp => headers.push(comp.location));
    }
    if (showInflation) headers.push('inflation');
    
    // Data rows
    const csvData = chartData.map(row => {
      return headers.map(header => row[header] || '').join(',');
    });
    
    // Create and download CSV
    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.primary.metric}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render different chart types
  const renderChart = () => {
    const commonProps = {
      data: chartType === 'yoy' ? yoyData : chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };
    
    const commonAxisProps = {
      xAxis: <XAxis 
        dataKey="year" 
        label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }} 
      />,
      yAxis: <YAxis 
        label={{ 
          value: chartType === 'yoy' 
            ? 'Percentage Change (%)' 
            : data.primary.unit, 
          angle: -90, 
          position: 'insideLeft' 
        }} 
      />,
      cartesianGrid: <CartesianGrid strokeDasharray="3 3" />,
      tooltip: <Tooltip 
        formatter={formatValue}
        labelFormatter={(label) => `Year: ${label}`}
      />,
      legend: <Legend />
    };
    
    // Helper to generate series based on chart type
    const generateSeries = () => {
      const isYoY = chartType === 'yoy';
      const primaryKey = isYoY ? `${data.primary.location} YoY` : data.primary.location;
      
      // Create array to hold all series
      const series = [];
      
      // Add primary series
      switch (chartType) {
        case 'line':
        case 'yoy':
          series.push(
            <Line
              key={primaryKey}
              type="monotone"
              dataKey={primaryKey}
              stroke={CHART_COLORS[0]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          );
          break;
        case 'bar':
          series.push(
            <Bar
              key={primaryKey}
              dataKey={primaryKey}
              fill={CHART_COLORS[0]}
            />
          );
          break;
        case 'area':
          series.push(
            <Area
              key={primaryKey}
              type="monotone"
              dataKey={primaryKey}
              stroke={CHART_COLORS[0]}
              fill={`${CHART_COLORS[0]}33`}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          );
          break;
      }
      
      // Add comparison series
      if (data.comparisons && data.comparisons.length > 0) {
        data.comparisons.forEach((comparison, index) => {
          const compKey = isYoY ? `${comparison.location} YoY` : comparison.location;
          const colorIndex = (index + 1) % CHART_COLORS.length;
          
          switch (chartType) {
            case 'line':
            case 'yoy':
              series.push(
                <Line
                  key={compKey}
                  type="monotone"
                  dataKey={compKey}
                  stroke={CHART_COLORS[colorIndex]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              );
              break;
            case 'bar':
              series.push(
                <Bar
                  key={compKey}
                  dataKey={compKey}
                  fill={CHART_COLORS[colorIndex]}
                />
              );
              break;
            case 'area':
              series.push(
                <Area
                  key={compKey}
                  type="monotone"
                  dataKey={compKey}
                  stroke={CHART_COLORS[colorIndex]}
                  fill={`${CHART_COLORS[colorIndex]}33`}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              );
              break;
          }
        });
      }
      
      // Add inflation if needed
      if (showInflation) {
        series.push(
          <Line
            key="inflation"
            type="monotone"
            dataKey="inflation"
            stroke="#ff0000"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 6 }}
          />
        );
        
        // Add zero reference line for YoY charts
        if (chartType === 'yoy') {
          series.push(
            <ReferenceLine key="zero-line" y={0} stroke="#666" strokeDasharray="3 3" />
          );
        }
      }
      
      return series;
    };
    
    // Select container based on chart type
    switch (chartType) {
      case 'line':
      case 'yoy':
        return (
          <LineChart {...commonProps}>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {generateSeries()}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {generateSeries()}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {generateSeries()}
          </AreaChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            {commonAxisProps.cartesianGrid}
            {commonAxisProps.xAxis}
            {commonAxisProps.yAxis}
            {commonAxisProps.tooltip}
            {commonAxisProps.legend}
            {generateSeries()}
          </LineChart>
        );
    }
  };
  
  // Chart type options
  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'yoy', label: 'Year-over-Year % Change' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={chartType}
            onChange={(e) => onChartTypeChange?.(e.target.value as ChartType)}
          >
            {chartTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {chartType === 'yoy' && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInflation}
                onChange={(e) => setShowInflation(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Show Inflation</span>
            </label>
          )}
        </div>
        
        <button
          onClick={downloadCSV}
          className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium"
        >
          Export CSV
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart; 