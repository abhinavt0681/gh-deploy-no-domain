'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AnalyticsChart, { AnalyticsData, TimeSeriesDataPoint, ChartType } from '@/components/AnalyticsChart';
import FilterPanel from '@/components/FilterPanel';
import MetricCard from '@/components/MetricCard';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [housingType, setHousingType] = useState('condos');
  const [location, setLocation] = useState('');
  const [compareLocations, setCompareLocations] = useState<string[]>([]);
  const [metric, setMetric] = useState('median_price');
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2023);
  const [chartType, setChartType] = useState<ChartType>('line');
  
  // Data state with proper typing
  const [chartData, setChartData] = useState<AnalyticsData | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  
  // Use environment variable with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Load available locations when housing type changes
  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/analytics/locations?housing_type=${housingType}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();
        setLocations(data.locations);
        
        // Set default location if none selected
        if (!location && data.locations.length > 0) {
          setLocation(data.locations[0]);
        }
      } catch (err) {
        setError('Error loading locations. Please try again.');
        console.error(err);
      }
    }
    
    fetchLocations();
  }, [housingType, location]);
  
  // Load available metrics
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/analytics/metrics`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError('Error loading metrics. Please try again.');
        console.error(err);
      }
    }
    
    fetchMetrics();
  }, []);
  
  // Fetch chart data when filters change
  useEffect(() => {
    if (!location) return;
    
    async function fetchChartData() {
      setLoading(true);
      setError(null);
      
      try {
        let url = `${API_URL}/api/v1/analytics/data?` +
          `housing_type=${housingType}&` +
          `location=${encodeURIComponent(location)}&` +
          `start_year=${startYear}&` +
          `end_year=${endYear}&` +
          `metric=${metric}`;
        
        // Add comparison locations if any
        if (compareLocations.length > 0) {
          url += `&compare_locations=${compareLocations.map(loc => encodeURIComponent(loc)).join(',')}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError('Error loading data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChartData();
  }, [housingType, location, compareLocations, metric, startYear, endYear]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-700">
            <Link href="/">Grace Harbor Analytics</Link>
          </h1>
          <nav>
            <Link 
              href="/compare" 
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Compare Markets
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Market Dashboard</h2>
          <p className="text-gray-600">
            Explore real estate trends across Massachusetts
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel 
              housingType={housingType}
              setHousingType={setHousingType}
              location={location}
              setLocation={setLocation}
              compareLocations={compareLocations}
              setCompareLocations={setCompareLocations}
              locations={locations}
              metric={metric}
              setMetric={setMetric}
              metrics={metrics}
              startYear={startYear}
              setStartYear={setStartYear}
              endYear={endYear}
              setEndYear={setEndYear}
            />
          </div>
          
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-96">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : chartData ? (
              <>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {metrics[metric]?.description || metric} in {location}
                    {compareLocations.length > 0 && ` (with ${compareLocations.length} comparison${compareLocations.length > 1 ? 's' : ''})`}
                  </h3>
                  <AnalyticsChart 
                    data={chartData} 
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard 
                    title="Average"
                    value={calculateAverage(chartData)}
                    unit={chartData.primary.unit}
                    trend={calculateTrend(chartData)}
                  />
                  <MetricCard 
                    title="Minimum"
                    value={calculateMin(chartData)}
                    unit={chartData.primary.unit}
                  />
                  <MetricCard 
                    title="Maximum"
                    value={calculateMax(chartData)}
                    unit={chartData.primary.unit}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <MetricCard 
                    title="Avg YoY % Change (Selections)"
                    value={calculateAverageYoYChange(chartData)}
                    unit="percentage"
                    trend={calculateAverageYoYChange(chartData) > 0 ? 'up' : (calculateAverageYoYChange(chartData) < 0 ? 'down' : 'neutral')}
                  />
                  <MetricCard 
                    title="Avg Inflation Rate"
                    value={calculateAverageInflation(startYear, endYear)}
                    unit="percentage"
                    trend="neutral"
                  />
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-96">
                <p className="text-gray-500">Select filters to view data</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper functions for calculating statistics
function calculateAverage(data: AnalyticsData): number {
  if (!data?.primary?.data?.length) return 0;
  const sum = data.primary.data.reduce((acc: number, point: TimeSeriesDataPoint) => acc + point.value, 0);
  return Math.round((sum / data.primary.data.length) * 100) / 100;
}

function calculateMin(data: AnalyticsData): number {
  if (!data?.primary?.data?.length) return 0;
  return Math.min(...data.primary.data.map((point: TimeSeriesDataPoint) => point.value));
}

function calculateMax(data: AnalyticsData): number {
  if (!data?.primary?.data?.length) return 0;
  return Math.max(...data.primary.data.map((point: TimeSeriesDataPoint) => point.value));
}

function calculateTrend(data: AnalyticsData): 'up' | 'down' | 'neutral' {
  if (!data?.primary?.data?.length || data.primary.data.length < 2) return 'neutral';
  
  const firstValue = data.primary.data[0].value;
  const lastValue = data.primary.data[data.primary.data.length - 1].value;
  
  if (lastValue > firstValue) return 'up';
  if (lastValue < firstValue) return 'down';
  return 'neutral';
}

// Calculate average year-over-year percentage change
function calculateAverageYoYChange(data: AnalyticsData): number {
  if (!data?.primary?.data?.length || data.primary.data.length < 2) return 0;
  
  // Calculate YoY changes for primary location
  const yoyChanges = [];
  for (let i = 1; i < data.primary.data.length; i++) {
    const currentValue = data.primary.data[i].value;
    const previousValue = data.primary.data[i-1].value;
    
    if (previousValue !== 0) {
      const percentChange = ((currentValue - previousValue) / previousValue) * 100;
      yoyChanges.push(percentChange);
    }
  }
  
  // If there are comparison locations, calculate their YoY changes too
  if (data.comparisons && data.comparisons.length > 0) {
    data.comparisons.forEach(comparison => {
      if (comparison.data.length < 2) return;
      
      for (let i = 1; i < comparison.data.length; i++) {
        const currentValue = comparison.data[i].value;
        const previousValue = comparison.data[i-1].value;
        
        if (previousValue !== 0) {
          const percentChange = ((currentValue - previousValue) / previousValue) * 100;
          yoyChanges.push(percentChange);
        }
      }
    });
  }
  
  // Calculate the average of all YoY changes
  if (yoyChanges.length === 0) return 0;
  const sum = yoyChanges.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / yoyChanges.length).toFixed(2));
}

// Calculate average inflation rate for the selected years
function calculateAverageInflation(startYear: number, endYear: number): number {
  // Inflation data by year (already defined in AnalyticsChart.tsx)
  const INFLATION_DATA: Record<number, number> = {
    1995: 2.50, 1996: 3.30, 1997: 1.70, 1998: 1.60, 1999: 2.70,
    2000: 3.40, 2001: 1.60, 2002: 2.40, 2003: 1.90, 2004: 3.30,
    2005: 3.40, 2006: 2.50, 2007: 4.10, 2008: 0.10, 2009: 2.70,
    2010: 1.50, 2011: 3.00, 2012: 1.70, 2013: 1.50, 2014: 0.80,
    2015: 0.70, 2016: 2.10, 2017: 2.10, 2018: 1.90, 2019: 2.30,
    2020: 1.40, 2021: 7.00, 2022: 6.50, 2023: 3.40, 2024: 2.90
  };
  
  // Get inflation rates for the selected year range
  const inflationRates = [];
  for (let year = startYear; year <= endYear; year++) {
    if (INFLATION_DATA[year] !== undefined) {
      inflationRates.push(INFLATION_DATA[year]);
    }
  }
  
  // Calculate the average
  if (inflationRates.length === 0) return 0;
  const sum = inflationRates.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / inflationRates.length).toFixed(2));
} 