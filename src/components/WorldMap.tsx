"use client";

import React, { memo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Coordinates: [longitude, latitude]
const markers = [
  { markerOffset: -15, name: "New York", coordinates: [-74.006, 40.7128] },
  { markerOffset: -15, name: "London", coordinates: [-0.1276, 51.5072] },
  { markerOffset: 15, name: "Tokyo", coordinates: [139.6917, 35.6895] },
  { markerOffset: 15, name: "Jakarta", coordinates: [106.8456, -6.2088] },
  { markerOffset: -15, name: "Berlin", coordinates: [13.4050, 52.5200] },
  { markerOffset: 15, name: "Sydney", coordinates: [151.2093, -33.8688] },
  { markerOffset: -15, name: "São Paulo", coordinates: [-46.6333, -23.5505] },
  { markerOffset: 15, name: "Cape Town", coordinates: [18.4232, -33.9249] },
  { markerOffset: -15, name: "Seoul", coordinates: [126.9780, 37.5665] },
  { markerOffset: 15, name: "Dubai", coordinates: [55.2708, 25.2048] }
];

const WorldMap = () => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#0d0d0d] overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing">
      <ComposableMap 
        projectionConfig={{ scale: 160 }} 
        className="w-full h-full opacity-80"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="#444" />
          </pattern>
        </defs>
        
        <ZoomableGroup zoom={1.2} center={[0, 10]} maxZoom={4} minZoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="url(#dots)"
                  stroke="none"
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "url(#dots)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map(({ name, coordinates }) => (
            <Marker 
              key={name} 
              coordinates={coordinates as [number, number]}
              onMouseEnter={() => setHoveredMarker(name)}
              onMouseLeave={() => setHoveredMarker(null)}
              className="cursor-pointer outline-none"
            >
              {/* Thin interactive pulsing ring on hover */}
              {hoveredMarker === name && (
                <circle 
                  r={8} 
                  fill="transparent"
                  stroke="#D4FF00"
                  strokeWidth={0.5}
                  className="animate-ping origin-center" 
                  style={{ animationDuration: '2s', opacity: 0.8 }}
                />
              )}
              {/* The solid center dot with a subtle glow */}
              <circle 
                r={hoveredMarker === name ? 4 : 3} 
                fill="#D4FF00" 
                style={{ 
                  filter: hoveredMarker === name ? 'drop-shadow(0px 0px 8px #D4FF00)' : 'drop-shadow(0px 0px 3px #D4FF00)',
                  transition: 'all 0.3s ease'
                }} 
              />
              {/* Tooltip text that appears on hover */}
              {hoveredMarker === name && (
                <text
                  textAnchor="middle"
                  y={-12}
                  style={{ 
                    fontFamily: "var(--font-sans), sans-serif", 
                    fill: "#fff", 
                    fontSize: "12px", 
                    fontWeight: "600",
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))'
                  }}
                  className="select-none pointer-events-none"
                >
                  {name}
                </text>
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);
