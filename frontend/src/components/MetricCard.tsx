'use client';

import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ title, value, unit, trend }: MetricCardProps) => {
  // Format value based on unit
  const formattedValue = () => {
    if (unit === 'dollars') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === 'ratio') {
      return value.toFixed(2);
    }
    if (unit === 'percentage') {
      return `${value.toFixed(2)}%`;
    }
    return value.toLocaleString();
  };
  
  // Determine trend icon and color
  const renderTrend = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-green-600">
            <FiArrowUp className="mr-1" />
            <span>Increasing</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-red-600">
            <FiArrowDown className="mr-1" />
            <span>Decreasing</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <FiMinus className="mr-1" />
            <span>Stable</span>
          </div>
        );
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-primary-700 mb-1">
        {formattedValue()}
      </div>
      {renderTrend()}
    </div>
  );
};

export default MetricCard; 