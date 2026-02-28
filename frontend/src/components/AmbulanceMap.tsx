import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import type { Ambulance } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface AmbulanceMapProps {
  ambulances: Ambulance[];
  center?: LatLngExpression;
  zoom?: number;
  height?: string | number;
  onAmbulanceClick?: (ambulance: Ambulance) => void;
}

// Component to recenter map when ambulances change
const MapRecenter: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  
  return null;
};

const AmbulanceMap: React.FC<AmbulanceMapProps> = ({
  ambulances,
  center = [26.8467, 80.9462], // Lucknow, UP coordinates
  zoom = 10,
  height = '600px',
  onAmbulanceClick,
}) => {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(center);

  // Update map center when ambulances change
  useEffect(() => {
    if (ambulances.length > 0) {
      const firstAmbulance = ambulances[0];
      if (firstAmbulance.current_location) {
        setMapCenter([
          firstAmbulance.current_location.latitude,
          firstAmbulance.current_location.longitude,
        ]);
      }
    }
  }, [ambulances]);

  // Create custom icons for different ambulance statuses
  const getAmbulanceIcon = (status: string) => {
    const colors: Record<string, string> = {
      available: '#4caf50',
      dispatched: '#ff9800',
      busy: '#f44336',
      maintenance: '#9e9e9e',
    };

    const color = colors[status] || '#2196f3';

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <path d="M12 4L8 8h3v8h2V8h3z" fill="white"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'dispatched':
        return 'warning';
      case 'busy':
        return 'error';
      default:
        return 'default';
    }
  };

  if (ambulances.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading ambulance locations...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapRecenter center={mapCenter} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ambulances.map((ambulance) => {
          if (!ambulance.current_location) return null;

          const position: LatLngExpression = [
            ambulance.current_location.latitude,
            ambulance.current_location.longitude,
          ];

          return (
            <Marker
              key={ambulance.ambulance_id}
              position={position}
              icon={getAmbulanceIcon(ambulance.status)}
              eventHandlers={{
                click: () => onAmbulanceClick?.(ambulance),
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {ambulance.vehicle_number}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={ambulance.status.toUpperCase()}
                      color={getStatusColor(ambulance.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="caption" display="block" color="text.secondary">
                    Driver: {ambulance.driver_name}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Phone: {ambulance.driver_phone}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    District: {ambulance.district}
                  </Typography>

                  {ambulance.speed !== undefined && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Speed: {ambulance.speed} km/h
                    </Typography>
                  )}

                  {ambulance.battery_level !== undefined && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Battery: {ambulance.battery_level}%
                    </Typography>
                  )}

                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    Last updated: {new Date(ambulance.last_updated).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default AmbulanceMap;
