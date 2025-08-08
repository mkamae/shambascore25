import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  isCurrency?: boolean;
  isFee?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, isCurrency = false, isFee = false }) => {
  const valueColor = isCurrency ? 'text-green-600' : isFee ? 'text-red-600' : 'text-gray-900';
  
  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className={`mt-1 text-3xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
};