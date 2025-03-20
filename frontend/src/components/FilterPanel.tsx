'use client';

import { Dispatch, SetStateAction } from 'react';

interface FilterPanelProps {
  housingType: string;
  setHousingType: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  compareLocations: string[];
  setCompareLocations: Dispatch<SetStateAction<string[]>>;
  locations: string[];
  metric: string;
  setMetric: Dispatch<SetStateAction<string>>;
  metrics: Record<string, any>;
  startYear: number;
  setStartYear: Dispatch<SetStateAction<number>>;
  endYear: number;
  setEndYear: Dispatch<SetStateAction<number>>;
}

const FilterPanel = ({
  housingType,
  setHousingType,
  location,
  setLocation,
  compareLocations,
  setCompareLocations,
  locations,
  metric,
  setMetric,
  metrics,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
}: FilterPanelProps) => {
  const housingTypes = [
    { value: 'condos', label: 'Condos' },
    { value: 'multifamily', label: 'Multi-Family' },
    { value: 'singlefamily', label: 'Single Family' },
  ];
  
  const yearOptions = Array.from({ length: 31 }, (_, i) => 1995 + i);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
      
      <div className="space-y-4">
        {/* Housing Type */}
        <div>
          <label htmlFor="housingType" className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            id="housingType"
            value={housingType}
            onChange={(e) => setHousingType(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {housingTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Location
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {locations.length === 0 ? (
              <option value="">Loading locations...</option>
            ) : (
              locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* Comparison Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compare With (up to 5)
          </label>
          <div className="space-y-2">
            {locations.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && compareLocations.length < 5) {
                    if (!compareLocations.includes(e.target.value) && e.target.value !== location) {
                      setCompareLocations([...compareLocations, e.target.value]);
                    }
                  }
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Add a location...</option>
                {locations
                  .filter(loc => loc !== location && !compareLocations.includes(loc))
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </option>
                  ))
                }
              </select>
            )}
            
            {compareLocations.length > 0 && (
              <div className="mt-2 space-y-2">
                {compareLocations.map((loc) => (
                  <div key={loc} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span className="text-sm font-medium">{loc}</span>
                    <button
                      type="button"
                      onClick={() => setCompareLocations(compareLocations.filter(l => l !== loc))}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Metric */}
        <div>
          <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
            Metric
          </label>
          <select
            id="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {Object.keys(metrics).length === 0 ? (
              <option value="">Loading metrics...</option>
            ) : (
              Object.entries(metrics).map(([key, info]: [string, any]) => (
                <option key={key} value={key}>
                  {info.description}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* Year Range */}
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
            Start Year
          </label>
          <select
            id="startYear"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {yearOptions.map((year) => (
              <option key={`start-${year}`} value={year} disabled={year >= endYear}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
            End Year
          </label>
          <select
            id="endYear"
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {yearOptions.map((year) => (
              <option key={`end-${year}`} value={year} disabled={year <= startYear}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 