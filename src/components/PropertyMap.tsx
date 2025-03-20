'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { AnalyticsData } from './AnalyticsChart';

// Import our Massachusetts GeoJSON data
import maData from '../data/massachusetts.json';

interface PropertyMapProps {
  housingType: string;
  metric: string;
  year: number;
  data?: Record<string, number>;
  loading?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  housingType,
  metric,
  year,
  data = {},
  loading = false
}) => {
  const [mapReady, setMapReady] = useState(false);

  // Make sure map is only rendered client-side
  useEffect(() => {
    setMapReady(true);
  }, []);

  // Function to determine circle size based on value
  const getCircleRadius = (value: number | undefined) => {
    if (!value) return 10; // Default size
    
    // Scale the radius based on the value
    // This is a simple implementation - you might want to normalize this based on your data ranges
    return Math.max(10, Math.min(30, value / 100000));
  };

  // Function to determine circle color based on value
  const getCircleColor = (value: number | undefined) => {
    if (!value) return '#cccccc'; // Default gray
    
    // Color scale based on value
    if (value < 300000) return '#4575b4'; // Blue for low values
    if (value < 600000) return '#91bfdb'; // Light blue
    if (value < 900000) return '#ffffbf'; // Yellow
    if (value < 1200000) return '#fc8d59'; // Orange
    return '#d73027'; // Red for high values
  };

  if (!mapReady) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="h-96 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/_/g, ' ')} by Location ({year})
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-80">
          <p className="text-gray-500">Loading map data...</p>
        </div>
      ) : (
        <MapContainer 
          center={[42.12, -71.5]} 
          zoom={8} 
          style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render city markers */}
          {maData.features.map((feature: any) => {
            const cityName = feature.properties.name;
            const coordinates = feature.geometry.coordinates;
            const value = data[cityName.toLowerCase()];
            
            return (
              <CircleMarker
                key={feature.properties.id}
                center={[coordinates[1], coordinates[0]]}
                radius={getCircleRadius(value)}
                fillColor={getCircleColor(value)}
                color="#000"
                weight={1}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <div>
                    <strong>{cityName}</strong><br />
                    {value ? `${metric.replace(/_/g, ' ')}: $${value.toLocaleString()}` : 'No data available'}
                  </div>
                </Tooltip>
                <Popup>
                  <div>
                    <h3 className="font-bold">{cityName}</h3>
                    <p className="mt-1">Property Type: {housingType.charAt(0).toUpperCase() + housingType.slice(1)}</p>
                    {value ? (
                      <p className="mt-1">{metric.replace(/_/g, ' ')}: ${value.toLocaleString()}</p>
                    ) : (
                      <p className="mt-1 text-red-500">No data available for {year}</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};

export default PropertyMap; 